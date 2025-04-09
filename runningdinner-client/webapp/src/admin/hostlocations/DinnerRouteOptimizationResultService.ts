import { DinnerRouteOptimizationResult, DinnerRouteTeam, Participant, Team } from "@runningdinner/shared";
import { deleteLocalStorageInAdminId, getLocalStorageInAdminId } from "../../common/LocalStorageService";

export class DinnerRouteOptimizationResultService {

  public static findDinnerRouteOptimizationResult(optimizationId: string, adminId: string): DinnerRouteOptimizationResult {
    const optimizationResult: DinnerRouteOptimizationResult = getLocalStorageInAdminId(optimizationId, adminId) as DinnerRouteOptimizationResult;
    if (!optimizationResult) {
      throw new Error(`Dinner routes not found in local storage for optimizationId: ${optimizationId} and adminId: ${adminId}`);
    }  
    return DinnerRouteOptimizationResultService.normalizeDinnerRouteOptimizationResult(optimizationResult);
  }
  
  public static deleteDinnerRouteOptimizationResult(optimizationId: string, adminId: string) {
    deleteLocalStorageInAdminId(optimizationId, adminId);
  }

  private static normalizeDinnerRouteOptimizationResult(optimizationResult: DinnerRouteOptimizationResult): DinnerRouteOptimizationResult {
  
    // All the following is a workaround for the fact that we serialize the date as string when putting into localstorage.
    // Due to we serialized the date as string when putting into localstorage, we need to cast it back to Date:

    const allTeamsOfDinnerRoutes = optimizationResult.optimizedDinnerRoutes.map(dinnerRoute => dinnerRoute.teams).flat();
    allTeamsOfDinnerRoutes.forEach(team => normalizeDinnerRouteTeam(team));
  
    const allCurrentTeams = optimizationResult.optimizedDinnerRoutes.map(dinnerRoute => dinnerRoute.currentTeam);
    allCurrentTeams.forEach(team => normalizeTeam(team));

    const teamsDistanceTeams = optimizationResult.optimizedDistances.dinnerRoutes.map(dinnerRoute => dinnerRoute.teams).flat();
    teamsDistanceTeams.forEach(team => normalizeDinnerRouteTeam(team));
  
    optimizationResult.optimizedTeamDistanceClusters.teamDistanceClusters.map(tdc => tdc.teams).flat().forEach(team => normalizeTeam(team));
  
    return optimizationResult;
  }
}

function normalizeDinnerRouteTeam(dinnerRouteTeam: DinnerRouteTeam) {
  dinnerRouteTeam.meal.time =  new Date(dinnerRouteTeam.meal.time);
  dinnerRouteTeam.hostTeamMember.activationDate = dinnerRouteTeam.hostTeamMember.activationDate ? new Date(dinnerRouteTeam.hostTeamMember.activationDate) : undefined
}

function normalizeTeam(team: Team) {
  team.meal.time = new Date(team.meal.time);
  normalizeParticipant(team.hostTeamMember);
  team.teamMembers.map(teamMember => normalizeParticipant(teamMember));
}

function normalizeParticipant(participant: Participant) {
  participant.activationDate = participant.activationDate ? new Date(participant.activationDate) : undefined
}

// function mapISODateStringToDate(dateString: string): Date {
//   return parseISO(dateString);
// }