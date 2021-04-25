import {createAction, createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {
  ALL_NAVIGATION_STEPS,
  ALL_NAVIGATION_STEPS_CLOSED_DINNER,
  applyDinnerDateToMeals,
  BasicDetailsNavigationStep,
  CreateRunningDinnerResponse,
  FetchStatus,
  fillDemoDinnerValues,
  FinishNavigationStep,
  MealTimesNavigationStep,
  NavigationStep,
  newInitialWizardState,
  OptionsNavigationStep,
  PublicRegistrationNavigationStep,
  setDefaultEndOfRegistrationDate,
  SummaryNavigationStep,
  WizardContextData
} from "./CreateWizardService";
import {WizardRootState} from "./WizardStore";
import find from "lodash/find";
import {RunningDinnerBasicDetails, RunningDinnerOptions, RunningDinnerPublicSettings, RunningDinnerType, Meal, HttpError} from "../types";
import {isStringEmpty, isStringNotEmpty} from "../Utils";
import {findGenderAspectsAsync, findRegistrationTypesAsync} from "../masterdata";
import {getMinimumParticipantsNeeded, isClosedDinner} from "../admin";
import { getAsHttpErrorOrDefault } from "../issue";

// *** Actions *** //
export const updateRunningDinnerType = createAction<RunningDinnerType>('updateRunningDinnerType');
export const updateBasicDetails = createAction<RunningDinnerBasicDetails>('updateBasicDetails');
export const updatePublicSettings = createAction<RunningDinnerPublicSettings>('updatePublicSettings');
export const updateRunningDinnerOptions = createAction<RunningDinnerOptions>('updateRunningDinnerOptions');
export const updateMeals = createAction<Meal[]>('updateMeals');
export const updateWithCreatedRunningDinner = createAction<CreateRunningDinnerResponse>('updateRunningDinnerCreated');
export const setNextNavigationStep = createAction<NavigationStep | undefined>('setNextNavigationStep');
export const setPreviousNavigationStep = createAction<NavigationStep | undefined>('setPreviousNavigationStep');

export const fetchRegistrationTypes = createAsyncThunk(
    'fetchRegistrationTypes',
    // Declare the type your function argument here:
    async () => {
      return await findRegistrationTypesAsync();
    }
);
export const fetchGenderAspects = createAsyncThunk(
    'fetchGenderAspects',
    // Declare the type your function argument here:
    async () => {
      return await findGenderAspectsAsync();
    }
);

// *** Reducer *** //
export const wizardSlice = createReducer(newInitialWizardState(), builder => {
  builder
      .addCase(updateRunningDinnerType, (state, action) => {
        state.runningDinner.runningDinnerType = action.payload;
        if (state.runningDinner.runningDinnerType === RunningDinnerType.DEMO) {
          fillDemoDinnerValues(state.runningDinner);
        }
      })
      .addCase(updateBasicDetails, (state, action) => {
        state.runningDinner.basicDetails = {...action.payload};
        setDefaultEndOfRegistrationDate(state.runningDinner);
        const updatedMeals = applyDinnerDateToMeals(state.runningDinner.options.meals, state.runningDinner.basicDetails.date);
        state.runningDinner.options.meals = updatedMeals;
        state.completedNavigationSteps.push(BasicDetailsNavigationStep);
      })
      .addCase(updateRunningDinnerOptions, (state, action) => {
        state.runningDinner.options = {...action.payload};
        state.completedNavigationSteps.push(OptionsNavigationStep);
      })
      .addCase(updateMeals, (state, action) => {
        state.runningDinner.options.meals = action.payload;
        state.completedNavigationSteps.push(MealTimesNavigationStep);
      })
      .addCase(updatePublicSettings, (state, action) => {
        state.runningDinner.publicSettings = action.payload;
        if (!isClosedDinner(state.runningDinner) && isStringEmpty(state.runningDinner.email)) {
          state.runningDinner.email = state.runningDinner.publicSettings.publicContactEmail;
        }
        if (isStringNotEmpty(state.runningDinner.publicSettings.publicContactName)) {
          state.runningDinner.contract.fullname = state.runningDinner.publicSettings.publicContactName;
        }
        state.completedNavigationSteps.push(PublicRegistrationNavigationStep);
      })
      .addCase(updateWithCreatedRunningDinner, (state, action) => {
        state.runningDinner = action.payload.runningDinner;
        state.administrationUrl = action.payload.administrationUrl;
        state.completedNavigationSteps.push(FinishNavigationStep);
      })
      .addCase(setNextNavigationStep, (state, action) => {
        state.nextNavigationStep = action.payload;
      })
      .addCase(setPreviousNavigationStep, (state, action) => {
        state.previousNavigationStep = action.payload;
      })

      .addCase(fetchRegistrationTypes.fulfilled, (state, action) => {
        handleFetchSucceeded(state.registrationTypes, action.payload);
      })
      .addCase(fetchRegistrationTypes.pending, (state) => {
        handleFetchLoading(state.registrationTypes);
      })
      .addCase(fetchRegistrationTypes.rejected, (state, action) => {
        handleFetchRejected(state.registrationTypes, action);
      })

      .addCase(fetchGenderAspects.fulfilled, (state, action) => {
        handleFetchSucceeded(state.genderAspects, action.payload);
      })
      .addCase(fetchGenderAspects.pending, (state) => {
        handleFetchLoading(state.genderAspects);
      })
      .addCase(fetchGenderAspects.rejected, (state, action) => {
        handleFetchRejected(state.genderAspects, action);
      })
});

// **** Selectors *** //
export const getAllNavigationStepsSelector = (state: WizardRootState) => {
  return isClosedDinnerSelector(state) ? ALL_NAVIGATION_STEPS_CLOSED_DINNER : ALL_NAVIGATION_STEPS;
};
export const getCurrentNavigationStepSelector = createSelector(
    (state: WizardRootState) => getAllNavigationStepsSelector(state),
    (state: WizardRootState) => state.administrationUrl,
    (state: WizardRootState) => state.nextNavigationStep,
    (state: WizardRootState) => state.completedNavigationSteps,
    (allNavigationStepsToRunThrough, administrationUrl, nextNavigationStep, completedNavigationSteps) => {

      let result;
      if (!nextNavigationStep || nextNavigationStep.value === SummaryNavigationStep.value) {
        result = {
          currentNavigationStep: isStringNotEmpty(administrationUrl) ? SummaryNavigationStep : FinishNavigationStep,
          percentage: 100,
          redirectToBeginOfWizard: false
        };
      } else {
        for (let i = 0; i < allNavigationStepsToRunThrough.length; i++) {
          if (allNavigationStepsToRunThrough[i].value === nextNavigationStep.value && i > 0) {
            const currentNavigationStep = allNavigationStepsToRunThrough[i - 1];
            result = {
              currentNavigationStep,
              redirectToBeginOfWizard: false,
              percentage: (i / allNavigationStepsToRunThrough.length) * 100  // We must use the currentStep (i -1) as factor, but due to we are 0-index-based, we just take i
            };
            break;
          }
        }
      }
      if (!result) {
        throw new Error(`nextNavigationStep is ${JSON.stringify(nextNavigationStep)}, but could not be found in allCurrentNavigationSteps`);
      }
      // Algorithm: Check if completedNavigationSteps contains the previous navigation step of the iterated navigation step (till we reach current step)
      // If not contained in completedNavigationSteps it was not run through!
      for (let i = 1; i < allNavigationStepsToRunThrough.length; i++) {
        if (result.currentNavigationStep.value === allNavigationStepsToRunThrough[i].value) {
          break;
        }
        const completedNavigationStep = find(completedNavigationSteps, ['value', allNavigationStepsToRunThrough[i-1].value]);
        if (!completedNavigationStep) {
          result.redirectToBeginOfWizard = true;
        }
      }

      return result;
    }
);

export const isDemoDinnerSelector = (state: WizardRootState) => state.runningDinner.runningDinnerType === RunningDinnerType.DEMO;
export const getRunningDinnerBasicDetailsSelector = (state: WizardRootState) => state.runningDinner.basicDetails;
export const getRunningDinnerOptionsSelector = (state: WizardRootState) => state.runningDinner.options;
export const getRunningDinnerPublicSettingsSelector = (state: WizardRootState) => state.runningDinner.publicSettings;
export const isClosedDinnerSelector = (state: WizardRootState) => isClosedDinner(state.runningDinner);
export const getAdministrationUrlSelector = (state: WizardRootState) => state.administrationUrl!;
export const getMinimumParticipantsNeededSelector = (state: WizardRootState) => getMinimumParticipantsNeeded(state.runningDinner.options);
export const getRunningDinnerSelector = (state: WizardRootState) => state.runningDinner;
export const getNavigationStepSelector = (state: WizardRootState) => {
  return {
    nextNavigationStep: state.nextNavigationStep,
    previousNavigationStep: state.previousNavigationStep
  };
}
export const isLoadingDataSelector = (state: WizardRootState) => {
  const loadingItems = getContextDataItems(state)
      .filter(item => item.fetchStatus === FetchStatus.LOADING);
  return loadingItems.length > 0;
};
export const getLoadingDataErrorSelector = (state: WizardRootState): HttpError | undefined => {
  const errorItems = getContextDataItems(state)
      .filter(item => item.fetchError !== undefined && item.fetchError !== null);
  return errorItems.length > 0 ? errorItems[0].fetchError : undefined;
}

const getContextDataItems = (state: WizardRootState): WizardContextData<any>[] => {
  return [state.registrationTypes, state.genderAspects];
};

export const getRegistrationTypesSelector = (state: WizardRootState) => {
  return {
    status: state.registrationTypes.fetchStatus,
    registrationTypes: state.registrationTypes.content
  };
};

export const getGenderAspectsSelector = (state: WizardRootState) => {
  return {
    status: state.genderAspects.fetchStatus,
    genderAspects: state.genderAspects.content
  }
};

// *** Misc **** //

function handleFetchSucceeded<T>(contextData: WizardContextData<T>, payload: T) {
  contextData.content = payload;
  contextData.fetchStatus = FetchStatus.SUCCEEDED;
  contextData.fetchError = mapFetchErrorState(FetchStatus.SUCCEEDED);
}

function handleFetchLoading<T>(contextData: WizardContextData<T>) {
  contextData.fetchStatus = FetchStatus.LOADING;
  contextData.fetchError = mapFetchErrorState(FetchStatus.LOADING);
}

function handleFetchRejected<T>(contextData: WizardContextData<T>, action?: any) {
  contextData.fetchStatus = FetchStatus.FAILED;
  contextData.fetchError = mapFetchErrorState(FetchStatus.FAILED, action);
}

const GENERIC_HTTP_ERROR: HttpError = { // Will trigger a generic error message (-> useNotificationHttpError)
  response: {
    status: 500,
    data: {}
  }
}
function mapFetchErrorState(fetchStatus: FetchStatus, action?: any): HttpError | undefined {
  let result = undefined;
  if (fetchStatus === FetchStatus.FAILED) {
    result = getAsHttpErrorOrDefault(action?.payload, GENERIC_HTTP_ERROR)
    // @ts-ignore
    console.log(`Fetch error: ${JSON.stringify(action)}`);
  }
  return result;
}