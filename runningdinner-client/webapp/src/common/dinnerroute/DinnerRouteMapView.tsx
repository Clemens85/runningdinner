import { DinnerRoute, isQuerySucceeded } from "@runningdinner/shared";
import { useGetGeocodePositionOfAfterPartyLocation, useGetGeocodePositionsOfTeamHosts } from "./useGetGeocodePositionsOfTeamHosts";
import { FetchProgressBar } from "../FetchProgressBar";
import { Map} from "@vis.gl/react-google-maps";
import { useRef } from "react";
import { useDynamicFullscreenHeight } from "../hooks/DynamicFullscreenHeightHook";
import { AfterPartyLocationMarker, CurrentPositionMarker, TeamHostMarker, WarningAlert } from "./DinnerRouteComponents";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from "../maps";
import { DinnerRouteMapData, calculateDinnerRouteMapData, findDinnerRouteMapEntryForCurrentDinnerRouteTeam } from "./DinnerRouteMapCalculationService";

type DinnerRouteMapViewProps = {
  dinnerRoute: DinnerRoute;
};

export function DinnerRouteMapView({dinnerRoute}: DinnerRouteMapViewProps) {
  
  const geocodePositionsQueryResult = useGetGeocodePositionsOfTeamHosts(dinnerRoute.teams, GOOGLE_MAPS_KEY);
  const geocodeAfterPartyQueryResult = useGetGeocodePositionOfAfterPartyLocation(dinnerRoute.afterPartyLocation, GOOGLE_MAPS_KEY);

  if (!isQuerySucceeded(geocodePositionsQueryResult) || !isQuerySucceeded(geocodeAfterPartyQueryResult)) {
    return <FetchProgressBar {...geocodePositionsQueryResult} />;
  }

  const settings =  {
    addMarkersForOtherHostTeams: true,
    currentTeamColorOverride: '#2e7d32',
    otherHostTeamColorOverride: '#999',
    afterPartyLocationColorOverride: '#999'
  };

  const dinnerRouteMapData = calculateDinnerRouteMapData([dinnerRoute], 
                                                         geocodePositionsQueryResult.data, 
                                                         geocodeAfterPartyQueryResult.data!,
                                                         settings);

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert />;
  }

  return (
    <MapView dinnerRouteMapData={dinnerRouteMapData} dinnerRoute={dinnerRoute}/>
  );
}

type MapViewProps = {
  dinnerRouteMapData: DinnerRouteMapData;
  dinnerRoute: DinnerRoute;
}

function calculateTeamOrderNumbers(dinnerRoute: DinnerRoute): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 0; i < dinnerRoute.teams.length; i++) {
    result[dinnerRoute.teams[i].teamNumber] = i + 1;
  }
  return result;
}

function MapView({dinnerRouteMapData, dinnerRoute}: MapViewProps) {
  
  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400);
  const currentPosError = null;

  const {dinnerRouteMapEntries, afterPartyLocationMapEntry, centerPosition, showWarnings} = dinnerRouteMapData;
  const currentDinnerRouteTeamEntry = findDinnerRouteMapEntryForCurrentDinnerRouteTeam(dinnerRouteMapData, dinnerRoute);
  const teamOrderNumberByTeamNumber = calculateTeamOrderNumbers(dinnerRoute)

  const teamConnectionPaths = currentDinnerRouteTeamEntry?.teamConnectionPaths || []; 
  const paths = teamConnectionPaths
                  .map(tcp => tcp.path)
                  .map(path => new google.maps.LatLng(path.lat!, path.lng!));

  return (
    <div ref={mapContainerRef}>
      <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }}
           defaultZoom={12} 
           style={{ height: `${mapHeight}px`}}
           mapId={GOOGLE_MAPS_ID}>

        <Polyline 
          key={currentDinnerRouteTeamEntry?.color} 
          strokeWeight={3}
          geodesic={true}
          icons={[ { icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '100%' } ]}
          path={paths}
          strokeColor={currentDinnerRouteTeamEntry?.color}/>

        { dinnerRouteMapEntries
            .map((team) => <TeamHostMarker key={team.teamNumber} 
                                                team={team} 
                                                scale={1.3}
                                                teamLabel={`#${teamOrderNumberByTeamNumber[team.teamNumber]}`}
                                                isCurrentTeam={dinnerRoute.currentTeam.teamNumber === team.teamNumber} />) 
        }

        { afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} /> }

        <CurrentPositionMarker onError={(error) => console.error(error)}/>

      </Map>
      { (showWarnings || currentPosError) && <WarningAlert /> }
    </div>
  )
}
