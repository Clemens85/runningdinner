import {createAction, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {
  FetchStatus,
  fillDemoDinnerValues,
  findRegistrationTypesAsync,
  MealTimesNavigationStep,
  newInitialWizardState,
  OptionsNavigationStep,
  RunningDinnerBasicDetails,
  RunningDinnerType,
  setDefaultEndOfRegistrationDate
} from "@runningdinner/shared";
import {WizardRootState} from "./WizardStore";

// *** Actions *** //
export const updateRunningDinnerType = createAction<RunningDinnerType>('updateRunningDinnerType');
export const updateBasicDetails = createAction<RunningDinnerBasicDetails>('updateBasicDetails');
export const fetchRegistrationTypes = createAsyncThunk(
    'fetchRegistrationTypes',
    // Declare the type your function argument here:
    async () => {
      const response = await findRegistrationTypesAsync();
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
        state.nextNavigationStep = MealTimesNavigationStep;
        state.previousNavigationStep = OptionsNavigationStep;
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
});

// **** Selectors *** //
export const getNavigationStepsSelector = (state: WizardRootState) => state.navigationSteps;
export const isDemoDinnerSelector = (state: WizardRootState) => state.runningDinner.runningDinnerType === RunningDinnerType.DEMO;
export const getRunningDinnerBasicDetailsSelector = (state: WizardRootState) => state.runningDinner.basicDetails;
export const getNextNavigationStepSelector = (state: WizardRootState) => state.nextNavigationStep;
export const isLoadingDataSelector = (state: WizardRootState) => {
  return state.fetchRegistrationTypesStatus === FetchStatus.LOADING;
};

export const getRegistrationTypesSelector = (state: WizardRootState) => {
  return {
    status: state.fetchRegistrationTypesStatus,
    registrationTypes: state.runningDinner.sessionData.registrationTypes
  };
};

// TODO
