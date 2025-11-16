import { FetchData, INITIAL_FETCH_DATA } from '../../redux';
import { DinnerRoute, SelfAdminSessionData, Team } from '../../types';

export interface SelfAdminState {
  selfAdminSessionData: FetchData<SelfAdminSessionData>;
  selfAdminTeam: FetchData<Team>;
  selfAdminDinnerRoute: FetchData<DinnerRoute>;
}

export function newInitialSelfAdminState(): SelfAdminState {
  return {
    selfAdminSessionData: INITIAL_FETCH_DATA,
    selfAdminTeam: INITIAL_FETCH_DATA,
    selfAdminDinnerRoute: INITIAL_FETCH_DATA,
  };
}
