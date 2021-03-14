import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {
  applyDinnerDateToMeals,
  FetchStatus,
  fillDemoDinnerValues,
  findGenderAspectsAsync,
  findRegistrationTypesAsync, getMinimumParticipantsNeeded, HttpError, isClosedDinner,
  LabelValue,
  Meal,
  newInitialWizardState,
  RunningDinnerBasicDetails, RunningDinnerOptions,
  RunningDinnerType,
  setDefaultEndOfRegistrationDate
} from "@runningdinner/shared";
import {WizardRootState} from "./WizardStore";

// *** Actions *** //
export const updateRunningDinnerType = createAction<RunningDinnerType>('updateRunningDinnerType');
export const updateBasicDetails = createAction<RunningDinnerBasicDetails>('updateBasicDetails');
export const updateRunningDinnerOptions = createAction<RunningDinnerOptions>('updateRunningDinnerOptions');
export const updateMeals = createAction<Meal[]>('updateMeals');
export const setNextNavigationStep = createAction<LabelValue | undefined>('setNextNavigationStep');
export const setPreviousNavigationStep = createAction<LabelValue | undefined>('setPreviousNavigationStep');

export const fetchRegistrationTypes = createAsyncThunk(
    'fetchRegistrationTypes',
    // Declare the type your function argument here:
    async () => {
      const response = await findRegistrationTypesAsync();
      return response;
    }
);
export const fetchGenderAspects = createAsyncThunk(
    'fetchGenderAspects',
    // Declare the type your function argument here:
    async () => {
      const response = await findGenderAspectsAsync();
      return response;
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
      })
      .addCase(updateRunningDinnerOptions, (state, action) => {
        state.runningDinner.options = {...action.payload};
      })
      .addCase(updateMeals, (state, action) => {
        state.runningDinner.options.meals = action.payload;
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
      })
      .addCase(fetchRegistrationTypes.pending, (state) => {
        state.fetchRegistrationTypesStatus = FetchStatus.LOADING;
      })
      .addCase(fetchRegistrationTypes.rejected, (state, action) => {
        state.fetchRegistrationTypesStatus = FetchStatus.FAILED;
      })

      .addCase(fetchGenderAspects.fulfilled, (state, action) => {
        state.runningDinner.sessionData.genderAspects = action.payload;
        state.fetchGenderAspectsStatus = FetchStatus.SUCCEEDED;
      })
      .addCase(fetchGenderAspects.pending, (state) => {
        state.fetchGenderAspectsStatus = FetchStatus.LOADING;
      })
      .addCase(fetchGenderAspects.rejected, (state) => {
        state.fetchGenderAspectsStatus = FetchStatus.FAILED;
      })
});

// **** Selectors *** //
export const getNavigationStepsSelector = (state: WizardRootState) => state.navigationSteps;
export const isDemoDinnerSelector = (state: WizardRootState) => state.runningDinner.runningDinnerType === RunningDinnerType.DEMO;
export const getRunningDinnerBasicDetailsSelector = (state: WizardRootState) => state.runningDinner.basicDetails;
export const getRunningDinnerOptionsSelector = (state: WizardRootState) => state.runningDinner.options;
export const isClosedDinnerSelector = (state: WizardRootState) => isClosedDinner(state.runningDinner);
export const getMinimumParticipantsNeededSelector = (state: WizardRootState) => getMinimumParticipantsNeeded(state.runningDinner);
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


