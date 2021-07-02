import {ActivityList, DashboardAdminActivities, Participant, RunningDinner} from "@runningdinner/shared";
import {FetchData, FetchStatus} from "../../redux/FetchHelpers";

const INITIAL_FETCH_DATA = {
  fetchStatus: FetchStatus.IDLE,
}

export interface AdminState {
  runningDinner: FetchData<RunningDinner>;
}

export interface DashboardState {
  adminActivities: FetchData<DashboardAdminActivities>,
  participantActivities: FetchData<ActivityList>
}

export interface ParticipantsState {
  participants: FetchData<Participant[]>
}


export function newInitialAdminState(): AdminState {
  return {
    runningDinner: INITIAL_FETCH_DATA
  }
}

export function newInitialDashboardState(): DashboardState {
  return {
    adminActivities: INITIAL_FETCH_DATA,
    participantActivities: INITIAL_FETCH_DATA
  }
}


