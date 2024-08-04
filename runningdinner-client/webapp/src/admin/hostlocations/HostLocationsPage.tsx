import { BaseRunningDinnerProps, isQuerySucceeded } from "@runningdinner/shared";
import { useRef } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { APIProvider, Map} from "@vis.gl/react-google-maps";
import { FetchProgressBar } from "../../common/FetchProgressBar";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from "../../common/maps";
import { AfterPartyLocationMarker, TeamHostMarker, WarningAlert, useGetGeocodePositionOfAfterPartyLocation, useGetGeocodePositionsOfTeamHosts } from "../../common/dinnerroute";
import { useFindAllDinnerRoutes } from "./useFindAllDinnerRoutes";
import { HostLocationsFilterMinimizedButton, HostLocationsFilterView } from "./HostLocationsFilterView";
import { BrowserTitle } from "../../common/mainnavigation/BrowserTitle";
import { DinnerRouteOverviewContextProvider, filterTeamConnectionPaths, useDinnerRouteOverviewContext, DinnerRouteTeamMapEntry, DinnerRouteMapData, calculateDinnerRouteMapData, distinctDinnerRouteTeams, } from "@runningdinner/shared";
import { DinnerRouteOverviewSettingsView } from "./DinnerRouteOverviewSettingsView";
import { useCalculateTeamDistanceClusters } from "./useCalculateTeamDistanceClusters";

export function HostLocationsPage({runningDinner}: BaseRunningDinnerProps) {
  return (
    <>
      <BrowserTitle titleI18nKey={'hostlocations_overview'} namespaces={'admin'} />
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <HostLocationsMapsPage runningDinner={runningDinner} />
      </APIProvider>
    </>
  )
}

function HostLocationsMapsPage({runningDinner}: BaseRunningDinnerProps) {
  
  const {adminId} = runningDinner;

  const dinnerRoutesQueryResult = useFindAllDinnerRoutes(adminId);
  const allDinnerRoutes = dinnerRoutesQueryResult.data?.dinnerRoutes || [];
  let allDinnerRouteTeams = allDinnerRoutes.flatMap(dinnerRoute => dinnerRoute.teams);
  allDinnerRouteTeams = distinctDinnerRouteTeams(allDinnerRouteTeams);

  const afterPartyLocation = allDinnerRoutes.length > 0 ? allDinnerRoutes[0].afterPartyLocation : null;

  const geocodePositionsQueryResult = useGetGeocodePositionsOfTeamHosts(allDinnerRouteTeams, GOOGLE_MAPS_KEY);
  const geocodeAfterPartyQueryResult = useGetGeocodePositionOfAfterPartyLocation(afterPartyLocation, GOOGLE_MAPS_KEY);

  const teamsWithZeroDistanceResult = useCalculateTeamDistanceClusters(adminId, geocodePositionsQueryResult?.data || [], 0);

  if (!isQuerySucceeded(geocodePositionsQueryResult) || !isQuerySucceeded(geocodeAfterPartyQueryResult) || !isQuerySucceeded(teamsWithZeroDistanceResult)) {
    return <FetchProgressBar {...geocodePositionsQueryResult} />;
  }

  const dinnerRouteMapData = calculateDinnerRouteMapData({
    allDinnerRoutes, 
    dinnerRouteTeamsWithGeocodes: geocodePositionsQueryResult.data, 
    afterPartyLocation: geocodeAfterPartyQueryResult.data!,
    teamClustersWithSameAddress: teamsWithZeroDistanceResult?.data || [],
    meals: runningDinner.options.meals
  });

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert />;
  }

  return (
    <DinnerRouteOverviewContextProvider runningDinner={runningDinner}>
      <HostLocationsView dinnerRouteMapData={dinnerRouteMapData} runningDinner={runningDinner} />
    </DinnerRouteOverviewContextProvider>
  );
}

type HostLocationsViewProps = {
  dinnerRouteMapData: DinnerRouteMapData;
} & BaseRunningDinnerProps;

function HostLocationsView({dinnerRouteMapData, runningDinner}: HostLocationsViewProps) {

  const {showWarnings, dinnerRouteMapEntries, centerPosition, afterPartyLocationMapEntry} = dinnerRouteMapData;

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400, true);

  const {state} = useDinnerRouteOverviewContext();
  const {hostFilterViewMinimized, settingsViewMinimized} = state;

  // const pathsByTeam = calculatePathsByTeam(dinnerRouteMapData, state);
  const filteredTeamConnectionPaths = filterTeamConnectionPaths(dinnerRouteMapData, state);

  return (
    <>
      <div ref={mapContainerRef}>
        <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }}
              defaultZoom={11} 
              style={{ height: `${mapHeight}px`}}
              mapId={GOOGLE_MAPS_ID}>


          { filteredTeamConnectionPaths.map(path => <TeamConnectionPathLine key={path.teamNumber} {...path} />) }

          { dinnerRouteMapEntries
              .map((team, index) => <TeamHostMarker key={team.teamNumber} 
                                                    team={team} 
                                                    isCurrentTeam={false}
                                                    teamLabel={`#${team.teamNumber}`}
                                                    zIndex={index}
                                                    scale={1.5} />) 
          }

          { afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} /> }
      
        </Map>
        { showWarnings && <WarningAlert /> }
      </div>

      { !settingsViewMinimized && <DinnerRouteOverviewSettingsView adminId={runningDinner.adminId} dinnerRouteMapEntries={dinnerRouteMapEntries} /> }      
      { settingsViewMinimized && <>TODO</> }      

      { !hostFilterViewMinimized && <HostLocationsFilterView dinnerRouteMapEntries={dinnerRouteMapEntries} /> }
      { hostFilterViewMinimized && <HostLocationsFilterMinimizedButton /> }
        
    </>
  )
}

function TeamConnectionPathLine({color, teamConnectionPaths}: DinnerRouteTeamMapEntry) {

  return (
    <>
      { teamConnectionPaths
        .filter(path => path.coordinates?.length >= 2)
        .map(path =>
          <Polyline 
              key={path.key} 
              strokeWeight={4}
              geodesic={true}
              icons={[ { icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '100%' } ]}
              strokeOpacity={1.0} 
              path={[ {lat: path.coordinates[0].lat!, lng: path.coordinates[0].lng!}, {lat: path.coordinates[1].lat!, lng: path.coordinates[1].lng!} ]}
              strokeColor={color}/>
        )
      }
    </>
  );
}