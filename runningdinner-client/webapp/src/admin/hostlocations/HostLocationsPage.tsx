import { Box } from '@mui/system';
import { BaseRunningDinnerProps, DinnerRouteMapCalculator, DinnerRouteOverviewActionType, isQuerySucceeded, isStringNotEmpty, TeamConnectionPath } from '@runningdinner/shared';
import { DinnerRouteMapData, DinnerRouteOverviewContextProvider, filterTeamConnectionPaths, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';

import { AfterPartyLocationMarker, TeamHostMarker, WarningAlert } from '../../common/dinnerroute';
import { FetchProgressBar } from '../../common/FetchProgressBar';
import { useDynamicFullscreenHeight } from '../../common/hooks/DynamicFullscreenHeightHook';
import { BrowserTitle } from '../../common/mainnavigation/BrowserTitle';
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_KEY, Polyline } from '../../common/maps';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import Paragraph from '../../common/theme/typography/Paragraph';
import { DinnerRouteOverviewHelpDialog } from './DinnerRouteOverviewHelpDialog.tsx';
import { MapControlsAppBar } from './MapControlsAppBar.tsx';
import { MapControlsOverlay } from './MapControlsOverlay';
import { MapControlsSidebar } from './MapControlsSidebar.tsx';
import { RouteOptimizationDialog } from './RouteOptimizationDialog.tsx';
import { RouteOptimizationPreviewBanner } from './RouteOptimizationPreviewBanner';
import { useCalculateRouteDistances } from './useCalculateRouteDistances.ts';
import { useFindAllDinnerRoutes } from './useFindAllDinnerRoutes';
import { useIsRouteOptimization } from './useIsRouteOptimization';
import { useShowRouteOptimizationSavedMessage } from './useShowRouteOptimizationSavedMessage';

export function HostLocationsPage({ runningDinner }: BaseRunningDinnerProps) {
  return (
    <>
      <BrowserTitle titleI18nKey={'hostlocations_overview'} namespaces={'admin'} />
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <HostLocationsMapsPage runningDinner={runningDinner} />
      </APIProvider>
    </>
  );
}

function HostLocationsMapsPage({ runningDinner }: BaseRunningDinnerProps) {
  const { adminId } = runningDinner;

  const dinnerRoutesQueryResult = useFindAllDinnerRoutes(adminId);
  const allDinnerRoutes = dinnerRoutesQueryResult.data?.dinnerRoutes || [];

  const afterPartyLocation = allDinnerRoutes.length > 0 ? allDinnerRoutes[0].afterPartyLocation : null;

  const optimizationId = useIsRouteOptimization();
  const isOptimizationPreview = isStringNotEmpty(optimizationId);

  if (!isQuerySucceeded(dinnerRoutesQueryResult)) {
    return <FetchProgressBar {...dinnerRoutesQueryResult} />;
  }

  const dinnerRouteMapCalculator = new DinnerRouteMapCalculator({
    allDinnerRoutes,
    afterPartyLocation,
    teamClustersWithSameAddress: dinnerRoutesQueryResult.data?.teamNeighbourClustersSameAddress?.teamNeighbourClusters || [],
    meals: runningDinner.options.meals,
    teamClusterMappings: dinnerRoutesQueryResult.data?.teamClusterMappings || {},
  });
  const dinnerRouteMapData = dinnerRouteMapCalculator.calculateDinnerRouteMapData();

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert teamsWithUnresolvedGeocodings={dinnerRouteMapData.teamsWithUnresolvedGeocodings} />;
  }

  return (
    <DinnerRouteOverviewContextProvider runningDinner={runningDinner}>
      {isOptimizationPreview && <RouteOptimizationPreviewBanner adminId={adminId} optimizationId={optimizationId} />}
      <HostLocationsView dinnerRouteMapData={dinnerRouteMapData} runningDinner={runningDinner} />
    </DinnerRouteOverviewContextProvider>
  );
}

type HostLocationsViewProps = {
  dinnerRouteMapData: DinnerRouteMapData;
} & BaseRunningDinnerProps;

function HostLocationsView({ dinnerRouteMapData, runningDinner }: HostLocationsViewProps) {
  const { showRouteOptimizationSavedMessage, deleteRouteOptimizationSavedQueryParam } = useShowRouteOptimizationSavedMessage();
  const { showSuccess } = useCustomSnackbar();

  const { adminId } = runningDinner;

  const { dinnerRouteMapEntries, centerPosition, afterPartyLocationMapEntry, teamsWithUnresolvedGeocodings, numberOfClusters } = dinnerRouteMapData;

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400, true);

  const { data: routeDistancesList } = useCalculateRouteDistances(adminId);

  const { state, dispatch } = useDinnerRouteOverviewContext();
  const { showTeamClusters, showTeamPaths, isRouteOptimizationDialogOpen, isHelpDialogOpen, activeTeamsFilter } = state;

  const filteredTeamConnectionPaths = filterTeamConnectionPaths(dinnerRouteMapData, state);

  function handleOptimizationDialogClose() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_ROUTE_OPTIMIZATION_DIALOG,
    });
  }

  function handleHelpDialogClose() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_HELP_DIALOG,
    });
  }

  useEffect(() => {
    if (showRouteOptimizationSavedMessage) {
      showSuccess(
        <div>
          <Paragraph>
            <Trans i18nKey="admin:dinner_route_optimization_save_success_1" />
          </Paragraph>
          <Paragraph>
            <Trans i18nKey="admin:dinner_route_optimization_save_success_2" />
          </Paragraph>
        </div>,
        {
          autoHideDuration: 8000,
          wrapInHtmlContainer: true,
        },
      );
      deleteRouteOptimizationSavedQueryParam();
    }
  }, [showRouteOptimizationSavedMessage]);

  return (
    <Box>
      <MapControlsAppBar teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} numberOfClusters={numberOfClusters} />

      <MapControlsSidebar open={!!state.isSidebarOpen} adminId={adminId} dinnerRouteMapData={dinnerRouteMapData} routeDistancesList={routeDistancesList} />

      <div ref={mapContainerRef}>
        <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }} defaultZoom={11} style={{ height: `${mapHeight}px` }} zoomControl={true} mapId={GOOGLE_MAPS_ID}>
          {showTeamPaths && (
            <>
              {filteredTeamConnectionPaths.map((path) => (
                <TeamConnectionPathLine key={path.teamNumber} {...path} useSecondaryClusterColor={showTeamClusters} isSelected={!!activeTeamsFilter[path.teamNumber]} />
              ))}
            </>
          )}

          {dinnerRouteMapEntries.map((team, index) => (
            <TeamHostMarker
              key={team.teamNumber}
              team={team}
              isCurrentTeam={false}
              useSecondaryClusterColor={showTeamClusters}
              teamLabel={`#${team.teamNumber}`}
              zIndex={index}
              isSelected={!!activeTeamsFilter[team.teamNumber]}
            />
          ))}

          {afterPartyLocationMapEntry && <AfterPartyLocationMarker {...afterPartyLocationMapEntry} />}

          <MapControlsOverlay />

          <RouteOptimizationDialog adminId={adminId} onClose={handleOptimizationDialogClose} isOpen={isRouteOptimizationDialogOpen} routeDistanceMetrics={routeDistancesList} />

          {isHelpDialogOpen && <DinnerRouteOverviewHelpDialog onClose={handleHelpDialogClose} />}
        </Map>
      </div>
    </Box>
  );
}

type TeamConnectionPathLineProps = {
  teamConnectionPaths: TeamConnectionPath[];
  useSecondaryClusterColor: boolean;
  isSelected?: boolean;
};

function TeamConnectionPathLine({ teamConnectionPaths, useSecondaryClusterColor, isSelected }: TeamConnectionPathLineProps) {
  function getStrokeColor(path: TeamConnectionPath): string {
    const secondaryClusterColor = isStringNotEmpty(path.secondaryClusterColor) ? path.secondaryClusterColor : path.color;
    return useSecondaryClusterColor ? secondaryClusterColor : path.color;
  }

  return (
    <>
      {teamConnectionPaths
        .filter((path) => path.coordinates?.length >= 2)
        .map((path) => (
          <Polyline
            key={path.key}
            strokeWeight={isSelected ? 6 : 4}
            geodesic={true}
            icons={[
              { icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '60%' },
              { icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '12%' },
            ]}
            strokeOpacity={1.0}
            path={[
              { lat: path.coordinates[0].lat!, lng: path.coordinates[0].lng! },
              { lat: path.coordinates[1].lat!, lng: path.coordinates[1].lng! },
            ]}
            strokeColor={getStrokeColor(path)}
          />
        ))}
    </>
  );
}
