import { BaseRunningDinnerProps, isQuerySucceeded } from "@runningdinner/shared";
import { useRef, useState } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { APIProvider, Map} from "@vis.gl/react-google-maps";
import { FetchProgressBar } from "../../common/FetchProgressBar";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from "../../common/maps";
import { cloneDeep } from "lodash-es";
import {  AfterPartyLocationMarker, DinnerRouteMapData, DinnerRouteTeamMapEntry, TeamConnectionPath, TeamHostMarker, WarningAlert, calculateDinnerRouteMapData, distinctDinnerRouteTeams, useGetGeocodePositionOfAfterPartyLocation, useGetGeocodePositionsOfTeamHosts } from "../../common/dinnerroute";
import { useFindAllDinnerRoutes } from "./useFindAllDinnerRoutes";
import { HostLocationsFilterMinimizedButton, HostLocationsFilterView } from "./HostLocationsFilterView";
import { BrowserTitle } from "../../common/mainnavigation/BrowserTitle";

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

  if (!isQuerySucceeded(geocodePositionsQueryResult) || !isQuerySucceeded(geocodeAfterPartyQueryResult)) {
    return <FetchProgressBar {...geocodePositionsQueryResult} />;
  }

  const dinnerRouteMapData = calculateDinnerRouteMapData(allDinnerRoutes, geocodePositionsQueryResult.data, geocodeAfterPartyQueryResult.data!, {
    afterPartyLocationColorOverride: '#999'
  });

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert />;
  }

  return (
    <HostLocationsView {...dinnerRouteMapData} />
  )
}

function HostLocationsView({showWarnings, dinnerRouteMapEntries, centerPosition, afterPartyLocationMapEntry}: DinnerRouteMapData) {

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400, true);

  const [activeTeamsFilter, setActiveTeamsFilter] = useState<Record<number, DinnerRouteTeamMapEntry>>({});
  const [hostFilterViewMinimized, setHostFilterViewMinimized] = useState(false);

  const allTeamConnectionPaths = dinnerRouteMapEntries.flatMap(team => team.teamConnectionPaths);

  const handleActiveTeamsFilterChange = (dinnerRouteTeam: DinnerRouteTeamMapEntry, open: boolean) => {
    setActiveTeamsFilter(prevState => {
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
    Object.keys(activeTeamsFilter).forEach((teamNumber) => {
      const activeDinnerRouteTeamMapEntry = activeTeamsFilter[parseInt(teamNumber)];
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
    <>
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
                                           team={team} 
                                           isCurrentTeam={false}
                                           teamLabel={`#${team.teamNumber}`}
                                           scale={1.5} />) 
          }

          { afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} /> }
      
        </Map>
        { showWarnings && <WarningAlert /> }
      </div>
      { !hostFilterViewMinimized && 
        <HostLocationsFilterView dinnerRouteMapEntries={dinnerRouteMapEntries} 
                                 onFilterChange={(team, open) => handleActiveTeamsFilterChange(team, open)} 
                                 onToggleMinize={() => setHostFilterViewMinimized(true)}
                                 filteredTeams={activeTeamsFilter} /> 
      }
      { hostFilterViewMinimized && <HostLocationsFilterMinimizedButton onToggleMinize={() => setHostFilterViewMinimized(false)} /> }
    </>
  )
}
