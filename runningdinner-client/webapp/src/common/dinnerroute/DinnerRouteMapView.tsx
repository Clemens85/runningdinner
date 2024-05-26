import { DinnerRoute, getFullname, isQuerySucceeded } from "@runningdinner/shared";
import { useGetGeocodePositionOfAfterPartyLocation, useGetGeocodePositionsOfTeamHosts } from "./useGetGeocodePositionsOfTeamHosts";
import { FetchProgressBar } from "../FetchProgressBar";
import { AdvancedMarker, InfoWindow, Map, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useRef, useState } from "react";
import { useDynamicFullscreenHeight } from "../hooks/DynamicFullscreenHeightHook";
import { Box } from "@mui/system";
import { AfterPartyLocationCard, CurrentPositionMarker, TeamMarkerInfoWindowContent, WarningAlert } from "./DinnerRouteComponents";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from "../maps";
import { AfterPartyLocationMapEntry, DinnerRouteMapData, DinnerRouteTeamMapEntry, calculateDinnerRouteMapData, findDinnerRouteMapEntryForCurrentDinnerRouteTeam, getMarkerLabel } from "./DinnerRouteMapCalculationService";

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
    otherHostTeamColorOverride: '#999'
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

function MapView({dinnerRouteMapData, dinnerRoute}: MapViewProps) {
  
  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400);
  const currentPosError = null;

  const {dinnerRouteMapEntries, afterPartyLocationMapEntry, centerPosition, showWarnings} = dinnerRouteMapData;
  const currentDinnerRouteTeamEntry = findDinnerRouteMapEntryForCurrentDinnerRouteTeam(dinnerRouteMapData, dinnerRoute);

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
            .map((team, index) => <TeamHostMarker key={team.teamNumber} 
                                                  team={team} 
                                                  teamLabel={`#${index + 1}`}
                                                  isCurrentTeam={dinnerRoute.currentTeam.teamNumber === team.teamNumber} />) 
        }

        { afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} /> }

        <CurrentPositionMarker onError={(error) => console.error(error)}/>

      </Map>
      { (showWarnings || currentPosError) && <WarningAlert /> }
    </div>
  )
}

type TeamHostMarkerProps = {
  team: DinnerRouteTeamMapEntry;
  isCurrentTeam: boolean;
  teamLabel: string;
}

function TeamHostMarker({team, isCurrentTeam, teamLabel}: TeamHostMarkerProps) {
  
  const [open, setOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker 
        ref={markerRef}
        title={`Team ${team.teamNumber} - ${team.meal.label} (${getFullname(team.hostTeamMember)})`}
        onClick={() => setOpen(!open)}
        position={{ lat: team.position.lat!, lng: team.position.lng! }}> 
        <Pin 
          scale={1.3}
          background={team.color}
          borderColor={'#000'}>
            <span><center>{getMarkerLabel(team.meal.label)}</center> <center>{teamLabel}</center></span>
          </Pin>
      </AdvancedMarker>
      {open && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          onCloseClick={() => setOpen(false)}>
            <TeamMarkerInfoWindowContent isCurrentTeam={isCurrentTeam} team={team} />
        </InfoWindow>
      )}
    </>
  )
}

function AfterPartyLocationMarker(afterPartyLocationMapEntry: AfterPartyLocationMapEntry) {
  
  const [open, setOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const {position, color, title} = afterPartyLocationMapEntry;

  return (
    <>
      <AdvancedMarker 
        ref={markerRef}
        title={title}
        onClick={() => setOpen(!open)}
        position={{ lat: position.lat!, lng: position.lng! }}> 
        <Pin 
          scale={1.3}
          background={color}
          borderColor={'#000'}>
            <span><center>{getMarkerLabel(title)}</center></span>
          </Pin>
      </AdvancedMarker>
      {open && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          onCloseClick={() => setOpen(false)}>
          <Box p={1} style={{ backgroundColor: '#fff', opacity: 0.75}}>
            <AfterPartyLocationCard {...afterPartyLocationMapEntry} />
          </Box>
        </InfoWindow>
      )}
    </>
  )
}