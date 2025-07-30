import { deserializeResponseData, DinnerRouteOptimizationResult } from '@runningdinner/shared';
import { deleteLocalStorageByPrefix, deleteLocalStorageInAdminId, getLocalStorageInAdminId, setLocalStorageInAdminId } from '../../common/LocalStorageService';

export class DinnerRouteOptimizationResultService {
  public static findDinnerRouteOptimizationResult(optimizationId: string, adminId: string): DinnerRouteOptimizationResult {
    const key = DinnerRouteOptimizationResultService.buildLocalStorageKey(optimizationId);
    const optimizationResult: DinnerRouteOptimizationResult = getLocalStorageInAdminId(key, adminId) as DinnerRouteOptimizationResult;
    if (!optimizationResult) {
      throw new Error(`Dinner routes not found in local storage for optimizationId: ${optimizationId} and adminId: ${adminId}`);
    }
    return DinnerRouteOptimizationResultService.normalizeDinnerRouteOptimizationResult(optimizationResult);
  }

  public static saveDinnerRouteOptimizationResult(optimizationResult: DinnerRouteOptimizationResult, adminId: string) {
    const key = DinnerRouteOptimizationResultService.buildLocalStorageKey(optimizationResult.id);
    const prefixToDelete = DinnerRouteOptimizationResultService.buildLocalStorageKey('');
    deleteLocalStorageByPrefix(prefixToDelete); // Clean up previous optimizations (they may require some space and are anyway outdated)
    setLocalStorageInAdminId(key, optimizationResult, adminId);
  }

  public static deleteDinnerRouteOptimizationResult(optimizationId: string, adminId: string) {
    const key = DinnerRouteOptimizationResultService.buildLocalStorageKey(optimizationId);
    deleteLocalStorageInAdminId(key, adminId);
  }

  private static buildLocalStorageKey(optimizationId: string): string {
    return `route_optimization_${optimizationId}`;
  }

  private static normalizeDinnerRouteOptimizationResult(optimizationResult: DinnerRouteOptimizationResult): DinnerRouteOptimizationResult {
    // We might retrieve our optimizationResult by means of SSE (which bypasses HttpInterceptorConfig due to it's no REST call)
    // => Hence we need to manually deserialize response data here
    return deserializeResponseData(optimizationResult);
  }
}

// private static normalizeDinnerRouteOptimizationResult(optimizationResult: DinnerRouteOptimizationResult): DinnerRouteOptimizationResult {
//   // All the following is a workaround for the fact that we serialize the date as string when putting into localstorage.
//   // Due to we serialized the date as string when putting into localstorage, we need to cast it back to Date:

//   // const allTeamsOfDinnerRoutes = optimizationResult.optimizedDinnerRouteList.dinnerRoutes.map((dinnerRoute) => dinnerRoute.teams).flat();
//   // allTeamsOfDinnerRoutes.forEach((team) => normalizeDinnerRouteTeam(team));

//   // const allCurrentTeams = optimizationResult.optimizedDinnerRouteList.dinnerRoutes.map((dinnerRoute) => dinnerRoute.currentTeam);
//   // allCurrentTeams.forEach((team) => normalizeTeam(team));

//   // const teamsDistanceTeams = optimizationResult.optimizedDistances.dinnerRoutes.map((dinnerRoute) => dinnerRoute.teams).flat();
//   // teamsDistanceTeams.forEach((team) => normalizeDinnerRouteTeam(team));

//   // optimizationResult.optimizedTeamNeighbourClusters.teamNeighbourClusters
//   //   .map((tnc) => [tnc.a, tnc.b])
//   //   .flat()
//   //   .forEach((team) => normalizeTeam(team));

//   // normalizeAfterPartyLocation(optimizationResult.optimizedDinnerRouteList);

//   // return optimizationResult;
// }

// function normalizeDinnerRouteTeam(dinnerRouteTeam: DinnerRouteTeam) {
//   dinnerRouteTeam.meal.time = new Date(dinnerRouteTeam.meal.time);
//   dinnerRouteTeam.hostTeamMember.activationDate = dinnerRouteTeam.hostTeamMember.activationDate ? new Date(dinnerRouteTeam.hostTeamMember.activationDate) : undefined;
// }

// function normalizeTeam(team: Team) {
//   team.meal.time = new Date(team.meal.time);
//   normalizeParticipant(team.hostTeamMember);
//   team.teamMembers.map((teamMember) => normalizeParticipant(teamMember));
// }

// function normalizeParticipant(participant: Participant) {
//   participant.activationDate = participant.activationDate ? new Date(participant.activationDate) : undefined;
// }

// function normalizeAfterPartyLocation(dinnerRouteList: DinnerRouteList) {
//   dinnerRouteList.dinnerRoutes.forEach((dinnerRoute) => {
//     if (dinnerRoute.afterPartyLocation && dinnerRoute.afterPartyLocation.time) {
//       dinnerRoute.afterPartyLocation.time = new Date(dinnerRoute.afterPartyLocation.time);
//     }
//   });
// }
