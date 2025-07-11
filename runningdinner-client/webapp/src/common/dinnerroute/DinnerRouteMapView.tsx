import { DinnerRoute, DinnerRouteMapCalculator, isSameDinnerRouteTeam, Meal } from '@runningdinner/shared';
import { Map } from '@vis.gl/react-google-maps';
import { useRef } from 'react';
import { useDynamicFullscreenHeight } from '../hooks/DynamicFullscreenHeightHook';
import { AfterPartyLocationMarker, CurrentPositionMarker, TeamHostMarker, WarningAlert } from './DinnerRouteComponents';
import { GOOGLE_MAPS_ID, Polyline } from '../maps';
import { DinnerRouteMapData, DinnerRouteTeamMapEntry } from '@runningdinner/shared';

type DinnerRouteMapViewProps = {
  dinnerRoute: DinnerRoute;
  meals: Meal[];
};

export function DinnerRouteMapView({ dinnerRoute, meals }: DinnerRouteMapViewProps) {
  const dinnerRouteMapCalculator = new DinnerRouteMapCalculator({
    allDinnerRoutes: [dinnerRoute],
    afterPartyLocation: dinnerRoute.afterPartyLocation,
    teamClustersWithSameAddress: [],
    meals,
  });

  const dinnerRouteMapData = dinnerRouteMapCalculator.calculateDinnerRouteMapData();

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert teamsWithUnresolvedGeocodings={dinnerRouteMapData.teamsWithUnresolvedGeocodings} />;
  }

  return <MapView dinnerRouteMapData={dinnerRouteMapData} dinnerRoute={dinnerRoute} />;
}

type MapViewProps = {
  dinnerRouteMapData: DinnerRouteMapData;
  dinnerRoute: DinnerRoute;
};

function calculateTeamOrderNumbers(dinnerRoute: DinnerRoute): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 0; i < dinnerRoute.teams.length; i++) {
    result[dinnerRoute.teams[i].teamNumber] = i + 1;
  }
  return result;
}

function MapView({ dinnerRouteMapData, dinnerRoute }: MapViewProps) {
  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400);

  const { dinnerRouteMapEntries, afterPartyLocationMapEntry, centerPosition, teamsWithUnresolvedGeocodings } = dinnerRouteMapData;
  const teamOrderNumberByTeamNumber = calculateTeamOrderNumbers(dinnerRoute);

  return (
    <>
      <WarningAlert teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} />
      <div ref={mapContainerRef}>
        <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }} defaultZoom={12} style={{ height: `${mapHeight}px` }} mapId={GOOGLE_MAPS_ID}>
          {dinnerRouteMapData.dinnerRouteMapEntries.map((path) => (
            <TeamConnectionPathLine key={path.teamNumber} {...path} />
          ))}

          {dinnerRouteMapEntries.map((team) => (
            <TeamHostMarker
              key={team.teamNumber}
              team={team}
              scale={1.3}
              teamLabel={`#${teamOrderNumberByTeamNumber[team.teamNumber]}`}
              isCurrentTeam={isSameDinnerRouteTeam(dinnerRoute.currentTeam, team)}
            />
          ))}

          {afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} />}

          <CurrentPositionMarker onError={(error) => console.error(error)} />
        </Map>
      </div>
    </>
  );
}

function TeamConnectionPathLine({ color, teamConnectionPaths }: DinnerRouteTeamMapEntry) {
  return (
    <>
      {teamConnectionPaths
        .filter((path) => path.coordinates?.length >= 2)
        .map((path) => (
          <Polyline
            key={path.key}
            strokeWeight={4}
            geodesic={true}
            icons={[{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '50%' }]}
            strokeOpacity={1.0}
            path={[
              { lat: path.coordinates[0].lat!, lng: path.coordinates[0].lng! },
              { lat: path.coordinates[1].lat!, lng: path.coordinates[1].lng! },
            ]}
            strokeColor={color}
          />
        ))}
    </>
  );
}
