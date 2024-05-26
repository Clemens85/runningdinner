import { BaseRunningDinnerProps, getFullname,  isQuerySucceeded } from "@runningdinner/shared";
import { useRef, useState } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { APIProvider, AdvancedMarker, InfoWindow, Map, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { FetchProgressBar } from "../../common/FetchProgressBar";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from "../../common/maps";
import { cloneDeep } from "lodash-es";
import {  AfterPartyLocationMarker, DinnerRouteMapData, DinnerRouteTeamMapEntry, TeamConnectionPath, TeamMarkerInfoWindowContent, WarningAlert, calculateDinnerRouteMapData, distinctDinnerRouteTeams, getMarkerLabel, useGetGeocodePositionOfAfterPartyLocation, useGetGeocodePositionsOfTeamHosts } from "../../common/dinnerroute";
import { useFindAllDinnerRoutes } from "./useFindAllDinnerRoutes";

export function HostLocationsPage({runningDinner}: BaseRunningDinnerProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <HostLocationsMapsPage runningDinner={runningDinner} />
    </APIProvider>
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

  if (!isQuerySucceeded(geocodePositionsQueryResult) || !isQuerySucceeded(geocodeAfterPartyQueryResult)) {
    return <FetchProgressBar {...geocodePositionsQueryResult} />;
  }

  const dinnerRouteMapData = calculateDinnerRouteMapData(allDinnerRoutes, geocodePositionsQueryResult.data, geocodeAfterPartyQueryResult.data!, {});

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert />;
  }

  return (
    <HostLocationsView {...dinnerRouteMapData} />
  )
}

function HostLocationsView({showWarnings, dinnerRouteMapEntries, centerPosition, afterPartyLocationMapEntry}: DinnerRouteMapData) {

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400);

  const [teamHostMarkersActive, setTeamHostMarkersActive] = useState<Record<number, DinnerRouteTeamMapEntry>>({});
  
  const allTeamConnectionPaths = dinnerRouteMapEntries.flatMap(team => team.teamConnectionPaths);

  const handleTeamHostMarkerOpen = (dinnerRouteTeam: DinnerRouteTeamMapEntry, open: boolean) => {
    setTeamHostMarkersActive(prevState => {
      const result = cloneDeep(prevState);
      if (open) {
        result[dinnerRouteTeam.teamNumber] = dinnerRouteTeam;
      } else {
        delete result[dinnerRouteTeam.teamNumber];
      }
      return result;
    });
  };

  const calculatePaths = () => {

    const colorsToShow = new Array<string>();
    Object.keys(teamHostMarkersActive).forEach((teamNumber) => {
      const activeDinnerRouteTeamMapEntry = teamHostMarkersActive[parseInt(teamNumber)];
      if (activeDinnerRouteTeamMapEntry) {
        colorsToShow.push(activeDinnerRouteTeamMapEntry.color);
      }
    });

    const result: Record<string, TeamConnectionPath[]> = {};
    for (let i = 0; i < allTeamConnectionPaths.length; i++) {
      const color = allTeamConnectionPaths[i].color;

      if (colorsToShow.length > 0 && !colorsToShow.includes(color)) {
        continue;
      }

      if (!result[color]) {
        result[color] = [];
      }
      result[color].push(allTeamConnectionPaths[i]);
    }
    return result;
  }


  const pathsByTeam = calculatePaths();

  return (
    <div ref={mapContainerRef}>
      <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }}
            defaultZoom={11} 
            style={{ height: `${mapHeight}px`}}
            mapId={GOOGLE_MAPS_ID}>
            
        { Object.keys(pathsByTeam).map(color => 
            <Polyline 
              key={color} 
              strokeWeight={6}
              geodesic={true}
              icons={[ { icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '100%' } ]}
              strokeOpacity={0.75} 
              path={pathsByTeam[color].map(path => ({lat: path.path.lat!, lng: path.path.lng!}))}
              strokeColor={color}/>
          )
        }

        { dinnerRouteMapEntries
            .map(team => <TeamHostMarker key={team.teamNumber} 
                                         handleOpen={(open) => handleTeamHostMarkerOpen(team, open)}
                                         isOpen={teamHostMarkersActive[team.teamNumber] !== undefined}
                                         team={team} />) 
        }

        { afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} /> }
    
      </Map>
      { showWarnings && <WarningAlert /> }
    </div>
  )
}

type TeamHostMarkerProps = {
  handleOpen: (open: boolean) => void;
  team: DinnerRouteTeamMapEntry;
  isOpen: boolean;
}

function TeamHostMarker({team, handleOpen, isOpen}: TeamHostMarkerProps) {
  
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker 
        ref={markerRef}
        title={`Team ${team.teamNumber} - ${team.meal.label} (${getFullname(team.hostTeamMember)})`}
        onClick={() => handleOpen(!isOpen)}
        position={{ lat: team.position.lat!, lng: team.position.lng! }}> 
        <Pin 
          scale={1.5}
          background={team.color}
          borderColor={'#000'}>
            <span>
              <center>{getMarkerLabel(team.meal.label)}</center> <center>#{team.teamNumber}</center>
            </span>
          </Pin>
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          onCloseClick={() => handleOpen(false)}>
            <TeamMarkerInfoWindowContent team={team} isCurrentTeam={false} />
        </InfoWindow>
      )}
    </>
  )
}
