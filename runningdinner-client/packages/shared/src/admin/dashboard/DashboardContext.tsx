import React from "react";
import {
  DashboardAdminActivities,
  findAdminActivitiesByAdminIdAsync,
  findParticipantsAsync, findTeamsNotCancelledAsync, HttpError,
  MessageType,
  Parent,
} from "@runningdinner/shared";
import {newAction} from "@runningdinner/webapp/src/admin/messages/MessagesContext";

export type Dispatch = (action: Action) => void;

export interface Action {
  type: DashboardActionType;
  payload?: any;
}

export enum DashboardActionType {
  START_LOADING_ACTIVITIES = "START_LOADING_ACTIVITIES",
  FINISH_LOADING_ACTIVITIES = "FINISH_LOADING_ACTIVITIES",
  ERROR_LOADING_ACTIVITIES = "ERROR_LOADING_ACTIVITIES"
}

type DashboardState = {
  dashboardAdminActivities: DashboardAdminActivities;
  loading: boolean;
  error?: HttpError;
};

const INITIAL_DASHBOARD_STATE: DashboardState = {
  loading: true,
  dashboardAdminActivities: {
    activities: [],
    checkList: {}
  }
};

const DashboardContext = React.createContext<DashboardState>(INITIAL_DASHBOARD_STATE);
const DashboardDispatchContext = React.createContext<Dispatch | undefined>(undefined);

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case DashboardActionType.START_LOADING_ACTIVITIES: {
      return { ...state, loading: true, error: undefined };
    }
    case DashboardActionType.FINISH_LOADING_ACTIVITIES: {
      return { ...state, loading: false, error: undefined, dashboardAdminActivities: action.payload };
    }
    case DashboardActionType.ERROR_LOADING_ACTIVITIES: {
      return { ...state, loading: false, error: action.payload };
    }
    default: {
      throw new Error(`Unknown action type: ${JSON.stringify(action)}`);
    }
  }
}

export function DashboardStateProvider(props: Parent) {

  const [state, dispatch] = React.useReducer(
      dashboardReducer,
      INITIAL_DASHBOARD_STATE
  );

  return (
      <DashboardContext.Provider value={state}>
        <DashboardDispatchContext.Provider value={dispatch}>
          {props.children}
        </DashboardDispatchContext.Provider>
      </DashboardContext.Provider>
  );
}

export function useDashboardState() {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error(
        "useDashboardState must be used within a DashboardStateProvider"
    );
  }
  return context;
}

export function useDashboardDispatch() {
  const context = React.useContext(DashboardDispatchContext);
  if (context === undefined) {
    throw new Error(
        "useDashboardDispatch must be used within a DashboardStateProvider"
    );
  }
  return context;
}

export async function findAdminActivitiesAction(adminId: string, dispatch: Dispatch) {
  dispatch({ type: DashboardActionType.START_LOADING_ACTIVITIES });
  try {
    const result = await findAdminActivitiesByAdminIdAsync(adminId);
    dispatch({ type: DashboardActionType.FINISH_LOADING_ACTIVITIES, payload: result });
  } catch (error) {
    dispatch({ type: DashboardActionType.ERROR_LOADING_ACTIVITIES, payload: error });
  }
}