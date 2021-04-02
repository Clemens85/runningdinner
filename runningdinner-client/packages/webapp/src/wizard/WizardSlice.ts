import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {
  ALL_NAVIGATION_STEPS,
  ALL_NAVIGATION_STEPS_CLOSED_DINNER,
  applyDinnerDateToMeals, BasicDetailsNavigationStep,
  CreateRunningDinnerResponse,
  FetchStatus,
  fillDemoDinnerValues,
  findGenderAspectsAsync,
  findRegistrationTypesAsync, FinishNavigationStep, getAsHttpErrorOrDefault,
  getMinimumParticipantsNeeded,
  HttpError,
  isClosedDinner,
  isStringEmpty,
  isStringNotEmpty,
  Meal, MealTimesNavigationStep,
  NavigationStep,
  newInitialWizardState, OptionsNavigationStep, PublicRegistrationNavigationStep,
  RunningDinnerBasicDetails,
  RunningDinnerOptions,
  RunningDinnerPublicSettings,
  RunningDinnerType,
  setDefaultEndOfRegistrationDate, SummaryNavigationStep
} from "@runningdinner/shared";
import {WizardRootState} from "./WizardStore";
import find from "lodash/find";

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
        state.runningDinner.sessionData.registrationTypes = action.payload;
        state.fetchRegistrationTypesStatus = FetchStatus.SUCCEEDED;
        state.fetchRegistrationTypesError = mapFetchErrorState(state.fetchRegistrationTypesStatus);
      })
      .addCase(fetchRegistrationTypes.pending, (state) => {
        state.fetchRegistrationTypesStatus = FetchStatus.LOADING;
        state.fetchRegistrationTypesError = mapFetchErrorState(state.fetchRegistrationTypesStatus);
      })
      .addCase(fetchRegistrationTypes.rejected, (state, action) => {
        state.fetchRegistrationTypesStatus = FetchStatus.FAILED;
        state.fetchRegistrationTypesError = mapFetchErrorState(state.fetchRegistrationTypesStatus, action);
      })

      .addCase(fetchGenderAspects.fulfilled, (state, action) => {
        state.runningDinner.sessionData.genderAspects = action.payload;
        state.fetchGenderAspectsStatus = FetchStatus.SUCCEEDED;
        state.fetchGenderAspectsError = mapFetchErrorState(state.fetchGenderAspectsStatus);
      })
      .addCase(fetchGenderAspects.pending, (state) => {
        state.fetchGenderAspectsStatus = FetchStatus.LOADING;
        state.fetchGenderAspectsError = mapFetchErrorState(state.fetchGenderAspectsStatus);
      })
      .addCase(fetchGenderAspects.rejected, (state, action) => {
        state.fetchGenderAspectsStatus = FetchStatus.FAILED;
        state.fetchGenderAspectsError = mapFetchErrorState(state.fetchGenderAspectsStatus, action);
      })
});

// **** Selectors *** //
export const getAllNavigationStepsSelector = (state: WizardRootState) => {
  return isClosedDinnerSelector(state) ? ALL_NAVIGATION_STEPS_CLOSED_DINNER : ALL_NAVIGATION_STEPS;
};
export const getCurrentNavigationStepSelector = (state: WizardRootState) => {
  let result;
  const allNavigationStepsToRunThrough = getAllNavigationStepsSelector(state);
  if (!state.nextNavigationStep || state.nextNavigationStep.value === SummaryNavigationStep.value) {
    result = {
      currentNavigationStep: isStringNotEmpty(state.administrationUrl) ? SummaryNavigationStep : FinishNavigationStep,
      percentage: 100,
      redirectToBeginOfWizard: false
    };
  } else {
    for (let i = 0; i < allNavigationStepsToRunThrough.length; i++) {
      if (allNavigationStepsToRunThrough[i].value === state.nextNavigationStep.value && i > 0) {
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
    throw new Error(`nextNavigationStep is ${JSON.stringify(state.nextNavigationStep)}, but could not be found in allCurrentNavigationSteps`);
  }
  // Algorithm: Check if completedNavigationSteps contains the previous navigation step of the iterated navigation step (till we reach current step)
  // If not contained in completedNavigationSteps it was not run through!
  for (let i = 1; i < allNavigationStepsToRunThrough.length; i++) {
    if (result.currentNavigationStep.value === allNavigationStepsToRunThrough[i].value) {
      break;
    }
    const completedNavigationStep = find(state.completedNavigationSteps, ['value', allNavigationStepsToRunThrough[i-1].value]);
    if (!completedNavigationStep) {
      result.redirectToBeginOfWizard = true;
    }
  }

  return result;
}
export const isDemoDinnerSelector = (state: WizardRootState) => state.runningDinner.runningDinnerType === RunningDinnerType.DEMO;
export const getRunningDinnerBasicDetailsSelector = (state: WizardRootState) => state.runningDinner.basicDetails;
export const getRunningDinnerOptionsSelector = (state: WizardRootState) => state.runningDinner.options;
export const getRunningDinnerPublicSettingsSelector = (state: WizardRootState) => state.runningDinner.publicSettings;
export const isClosedDinnerSelector = (state: WizardRootState) => isClosedDinner(state.runningDinner);
export const getAdministrationUrlSelector = (state: WizardRootState) => state.administrationUrl!;
export const getMinimumParticipantsNeededSelector = (state: WizardRootState) => getMinimumParticipantsNeeded(state.runningDinner);
export const getRunningDinnerSelector = (state: WizardRootState) => state.runningDinner;
export const getNavigationStepSelector = (state: WizardRootState) => {
  return {
    nextNavigationStep: state.nextNavigationStep,
    previousNavigationStep: state.previousNavigationStep
  };
}
export const isLoadingDataSelector = (state: WizardRootState) => {
  return state.fetchRegistrationTypesStatus === FetchStatus.LOADING || state.fetchGenderAspectsStatus === FetchStatus.LOADING;
};
export const getLoadingDataErrorSelector = (state: WizardRootState): HttpError | undefined => {
  return state.fetchRegistrationTypesError || state.fetchGenderAspectsError;
}

export const getRegistrationTypesSelector = (state: WizardRootState) => {
  return {
    status: state.fetchRegistrationTypesStatus,
    registrationTypes: state.runningDinner.sessionData.registrationTypes
  };
};

export const getGenderAspectsSelector = (state: WizardRootState) => {
  return {
    status: state.fetchGenderAspectsStatus,
    genderAspects: state.runningDinner.sessionData.genderAspects
  }
};

// *** Misc **** //
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
    console.log(`Fetch error: ${JSON.stringify(action)}`);
  }
  return result;
}
