import { DinnerRoute, DinnerRouteTeam, GeocodingResult, findAllDinnerRoutesByAdminIdAsync, getFullname, isGeocodingResultValid, stringToColor } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type MapEntry = {
  color: string;
  position: GeocodingResult
};

export type TeamConnectionPath = {
  path: GeocodingResult;
  color: string;
  key: string;
}

export type DinnerRouteTeamMapEntry = {
  teamConnectionPaths: TeamConnectionPath[];
} & DinnerRouteTeam & MapEntry;


export type DinnerRouteMapData = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  showWarnings?: boolean;
  centerPosition: GeocodingResult;
};

export function useFindAllDinnerRoutes(adminId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findAllDinnerRoutesByAdminIdAsync(adminId),
    queryKey: ['findAllDinnerRoutesByAdminI', adminId],
  });
}


export function calculateDinnerRouteMapData(allDinnerRoutes: DinnerRoute[], incomingDinnerRouteTeamsWithGeocodes: DinnerRouteTeam[] | undefined): DinnerRouteMapData {

  let dinnerRouteTeamsWithGeocodes = incomingDinnerRouteTeamsWithGeocodes || [];
  dinnerRouteTeamsWithGeocodes = dinnerRouteTeamsWithGeocodes.filter(team => isGeocodingResultValid(team.geocodingResult));

  const dinnerRouteMapEntries = new Array<DinnerRouteTeamMapEntry>();

  let centerPosition;
  let showWarnings = false;

  for (let i = 0; i < allDinnerRoutes.length; i++) {
    const dinnerRoute = allDinnerRoutes[i];
    const currentTeam = dinnerRoute.currentTeam;
    
    const currentTeamWithGeocode = findDinnerRouteTeamByNumber(currentTeam.teamNumber, dinnerRouteTeamsWithGeocodes);
    if (!currentTeamWithGeocode) {
      showWarnings = true;
      continue;
    }

    const color = stringToColor(`${getFullname(currentTeam.hostTeamMember)}`);

    const teamConnectionPaths = new Array<TeamConnectionPath>();
    dinnerRoute.teams
      .forEach(team => {
        const teamWithGeocode = findDinnerRouteTeamByNumber(team.teamNumber, dinnerRouteTeamsWithGeocodes);
        if (teamWithGeocode) {
          teamConnectionPaths.push({
            path: teamWithGeocode.geocodingResult!,
            color,
            key: `${currentTeam.teamNumber}-${team.teamNumber}`
          });
        } else {
          showWarnings = true;
        }
      });

    dinnerRouteMapEntries.push({
      ...currentTeamWithGeocode,
      color,
      position: currentTeamWithGeocode.geocodingResult!,
      teamConnectionPaths
    });

    if (!centerPosition) {
      centerPosition = currentTeamWithGeocode.geocodingResult!;
    }
  
  }

  return {
    dinnerRouteMapEntries,
    centerPosition: centerPosition || { lat: 0, lng: 0 },
    showWarnings
  };
}

function findDinnerRouteTeamByNumber(teamNumber: number, incomingDinnerRouteTeamsWithGeocodes: DinnerRouteTeam[]) {
  return incomingDinnerRouteTeamsWithGeocodes.find(team => team.teamNumber === teamNumber);
}

export function distinctDinnerRouteTeams(allDinnerRouteTeams: DinnerRouteTeam[]): DinnerRouteTeam[] {
  return allDinnerRouteTeams.filter((team, index, self) => index === self.findIndex(t => t.teamNumber === team.teamNumber));
}
