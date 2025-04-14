import { BaseRunningDinnerProps, DinnerRouteMapCalculator, isQuerySucceeded, isStringNotEmpty, TeamConnectionPath} from "@runningdinner/shared";
import { useEffect, useRef } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { APIProvider, Map} from "@vis.gl/react-google-maps";
import { FetchProgressBar } from "../../common/FetchProgressBar";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from "../../common/maps";
import { AfterPartyLocationMarker, TeamHostMarker, WarningAlert, useGetGeocodePositionOfAfterPartyLocation, useGetGeocodePositionsOfTeamHosts } from "../../common/dinnerroute";
import { HostLocationsFilterMinimizedButton, HostLocationsFilterView } from "./HostLocationsFilterView";
import { BrowserTitle } from "../../common/mainnavigation/BrowserTitle";
import { DinnerRouteOverviewContextProvider, filterTeamConnectionPaths, useDinnerRouteOverviewContext, DinnerRouteTeamMapEntry, DinnerRouteMapData } from "@runningdinner/shared";
import { DinnerRouteOverviewSettingsMinimizedButton, DinnerRouteOverviewSettingsView } from "./DinnerRouteOverviewSettingsView";
import { useFindAllDinnerRoutes } from "./useFindAllDinnerRoutes";
import { useCalculateTeamDistanceClusters } from "./useCalculateTeamDistanceClusters";
import { useIsRouteOptimization} from "./useIsRouteOptimization";
import { RouteOptimizationPreviewBanner } from "./RouteOptimizationPreviewBanner";
import { useCustomSnackbar } from "../../common/theme/CustomSnackbarHook";
import { useShowRouteOptimizationSavedMessage } from "./useShowRouteOptimizationSavedMessage";
import Paragraph from "../../common/theme/typography/Paragraph";

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
  allDinnerRouteTeams = DinnerRouteMapCalculator.distinctDinnerRouteTeams(allDinnerRouteTeams);

  const afterPartyLocation = allDinnerRoutes.length > 0 ? allDinnerRoutes[0].afterPartyLocation : null;

  const geocodePositionsQueryResult = useGetGeocodePositionsOfTeamHosts(allDinnerRouteTeams, adminId, GOOGLE_MAPS_KEY);
  const geocodeAfterPartyQueryResult = useGetGeocodePositionOfAfterPartyLocation(afterPartyLocation, GOOGLE_MAPS_KEY);

  const teamsWithZeroDistanceResult = useCalculateTeamDistanceClusters(adminId, geocodePositionsQueryResult?.data || [], 0);

  const optimizationId = useIsRouteOptimization();
  const isOptimizationPreview = isStringNotEmpty(optimizationId);

  if (!isQuerySucceeded(geocodePositionsQueryResult) || !isQuerySucceeded(geocodeAfterPartyQueryResult) || !isQuerySucceeded(teamsWithZeroDistanceResult)) {
    return <FetchProgressBar {...geocodePositionsQueryResult} />;
  }

  const dinnerRouteMapCalculator = new DinnerRouteMapCalculator({
    allDinnerRoutes, 
    dinnerRouteTeamsWithGeocodes: geocodePositionsQueryResult.data, 
    afterPartyLocation: geocodeAfterPartyQueryResult.data!,
    teamClustersWithSameAddress: teamsWithZeroDistanceResult?.data || [],
    meals: runningDinner.options.meals,
    teamClusterMappings: dinnerRoutesQueryResult.data?.teamClusterMappings || {},
  });
  const dinnerRouteMapData = dinnerRouteMapCalculator.calculateDinnerRouteMapData();

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert teamsWithUnresolvedGeocodings={dinnerRouteMapData.teamsWithUnresolvedGeocodings} />;
  }

  return (
    <DinnerRouteOverviewContextProvider runningDinner={runningDinner}>
      { isOptimizationPreview && <RouteOptimizationPreviewBanner adminId={adminId} optimizationId={optimizationId} /> }
      <HostLocationsView dinnerRouteMapData={dinnerRouteMapData} runningDinner={runningDinner} />
    </DinnerRouteOverviewContextProvider>
  );
}

type HostLocationsViewProps = {
  dinnerRouteMapData: DinnerRouteMapData;
} & BaseRunningDinnerProps;

function HostLocationsView({dinnerRouteMapData, runningDinner}: HostLocationsViewProps) {

  const {showRouteOptimizationSavedMessage, deleteRouteOptimizationSavedQueryParam} = useShowRouteOptimizationSavedMessage();
  const {showSuccess} = useCustomSnackbar();

  const {dinnerRouteMapEntries, centerPosition, afterPartyLocationMapEntry} = dinnerRouteMapData;

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400, true);

  const {state} = useDinnerRouteOverviewContext();
  const {hostFilterViewMinimized, settingsViewMinimized, showTeamClusters, showTeamPaths} = state;

  const filteredTeamConnectionPaths = filterTeamConnectionPaths(dinnerRouteMapData, state);

  useEffect(() => {
    if (showRouteOptimizationSavedMessage) {
      showSuccess(
        <div>
          <Paragraph>Optimierte Dinner Routen wurden erfolgreich gespeichert.</Paragraph>
          <Paragraph>Du kannst dein altes Browser-Tab schließen, du findest die neue, jetzt optimierte, Routen-Übersicht hier.</Paragraph>
        </div>, {
        autoHideDuration: 8000,
        wrapInHtmlContainer: true
      });
      deleteRouteOptimizationSavedQueryParam();
    }
  }, [showRouteOptimizationSavedMessage]);

  return (
    <>
      <div ref={mapContainerRef}>
        <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }}
             defaultZoom={11} 
             style={{ height: `${mapHeight}px`}}
             mapId={GOOGLE_MAPS_ID}>


          { showTeamPaths && 
            <>
              { filteredTeamConnectionPaths.map(path => <TeamConnectionPathLine 
                                                            key={path.teamNumber} 
                                                            {...path} 
                                                            useSecondaryClusterColor={showTeamClusters} />) 
              }
            </>
          }

          { dinnerRouteMapEntries
              .map((team, index) => <TeamHostMarker key={team.teamNumber} 
                                                    team={team} 
                                                    isCurrentTeam={false}
                                                    useSecondaryClusterColor={showTeamClusters}
                                                    teamLabel={`#${team.teamNumber}`}
                                                    zIndex={index}
                                                    scale={1.5} />) 
          }

          { afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} /> }
      
          { !settingsViewMinimized && <DinnerRouteOverviewSettingsView adminId={runningDinner.adminId} dinnerRouteMapData={dinnerRouteMapData} /> }
          { settingsViewMinimized && <DinnerRouteOverviewSettingsMinimizedButton /> }      

          { !hostFilterViewMinimized && <HostLocationsFilterView dinnerRouteMapEntries={dinnerRouteMapEntries} /> }
          { hostFilterViewMinimized && <HostLocationsFilterMinimizedButton /> }

        </Map>
      </div>
    </>
  )
}

type TeamConnectionPathLineProps = {
  teamConnectionPaths: TeamConnectionPath[];
  useSecondaryClusterColor: boolean;
};

function TeamConnectionPathLine({teamConnectionPaths, useSecondaryClusterColor}: TeamConnectionPathLineProps) {

  function getStrokeColor(path: TeamConnectionPath): string {
    const secondaryClusterColor = isStringNotEmpty(path.secondaryClusterColor) ? path.secondaryClusterColor : path.color;
    return useSecondaryClusterColor ? secondaryClusterColor : path.color;
  }

  return (
    <>
      { teamConnectionPaths
        .filter(path => path.coordinates?.length >= 2)
        .map(path =>
          <Polyline 
              key={path.key} 
              strokeWeight={4}
              geodesic={true}
              icons={[ 
                {  icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '60%' },
                {  icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '12%' },
              ]}
              strokeOpacity={1.0} 
              path={[ {lat: path.coordinates[0].lat!, lng: path.coordinates[0].lng!}, {lat: path.coordinates[1].lat!, lng: path.coordinates[1].lng!} ]}
              strokeColor={getStrokeColor(path)}/>
        )
      }
    </>
  );
}
