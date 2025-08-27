// import { Box, Button, Checkbox, Fab, FormControlLabel, FormGroup, Paper, styled, Switch, SxProps } from '@mui/material';
// import { Span } from '../../common/theme/typography/Tags';
// import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
// import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
// import { useEffect, useRef } from 'react';
// import { useDynamicFullscreenHeight } from '../../common/hooks/DynamicFullscreenHeightHook';
// import { useIsBigDevice, useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
// import {
//   DinnerRouteOverviewActionType,
//   useDinnerRouteOverviewContext,
//   DinnerRouteTeamMapEntry,
//   isAfterPartyLocationDefined,
//   DinnerRouteMapCalculator,
// } from '@runningdinner/shared';
// import { TitleBar } from './TitleBar';
// import { useTranslation } from 'react-i18next';
// import { getTeamLabel } from '../../common/dinnerroute';
// import { useZoomToMarker } from './useZoomToMarker';
//
// type HostLocationsFilterViewProps = {
//   dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
// };
//
// const MinimizedFab = styled(Fab)({
//   margin: 0,
//   top: 'auto',
//   left: 'auto',
//   bottom: 40,
//   right: 80,
//   minWidth: 100,
//   position: 'fixed',
//   zIndex: 1,
// });
//
// export function HostLocationsFilterMinimizedButton() {
//   const { dispatch } = useDinnerRouteOverviewContext();
//   const { t } = useTranslation('common');
//
//   function handleMaximizeFilterView() {
//     dispatch({
//       type: DinnerRouteOverviewActionType.UPDATE_HOST_FILTER_VIEW_MINIMIZED,
//       payload: false,
//     });
//   }
//
//   return (
//     <MinimizedFab variant="extended" color="primary" onClick={handleMaximizeFilterView}>
//       {t('common:filter')}
//       <OpenInFullRoundedIcon sx={{ ml: 1 }} />
//     </MinimizedFab>
//   );
// }
//
// export function HostLocationsFilterView({ dinnerRouteMapEntries }: HostLocationsFilterViewProps) {
//   const { dispatch, state } = useDinnerRouteOverviewContext();
//   const { scrollToTeamRequest } = state;
//
//   const isMobileDevice = useIsMobileDevice();
//   const isBigDevice = useIsBigDevice();
//
//   const teamsFilterContainerRef = useRef(null);
//   const teamsFilterHeight = useDynamicFullscreenHeight(teamsFilterContainerRef, 300, true) - (isMobileDevice ? 150 : 200);
//
//   const virtuosoRef = useRef<VirtuosoHandle>(null);
//
//   const { t } = useTranslation('common');
//
//   let paperWidth = isMobileDevice ? 150 : 380; // 380 is for tablet devices
//   if (isBigDevice) {
//     paperWidth = 470;
//   }
//
//   const hostFilterPaperStyles: SxProps = {
//     top: 160,
//     right: isMobileDevice ? 5 : 50,
//     position: 'fixed',
//     minWidth: paperWidth,
//     maxWidth: 280,
//     zIndex: 10,
//   };
//
//   function handleMinimizeFilterView() {
//     dispatch({
//       type: DinnerRouteOverviewActionType.UPDATE_HOST_FILTER_VIEW_MINIMIZED,
//       payload: true,
//     });
//   }
//
//   function handleScrollToTeam(scrollToTeamWithNumber: number) {
//     if (!virtuosoRef.current) {
//       return;
//     }
//
//     let teamIndex = -1;
//     for (let i = 0; i < dinnerRouteMapEntries.length; i++) {
//       const team = dinnerRouteMapEntries[i];
//       if (team.teamNumber === scrollToTeamWithNumber) {
//         teamIndex = i;
//         break;
//       }
//     }
//     if (teamIndex < 0) {
//       return;
//     }
//
//     virtuosoRef.current.scrollToIndex({
//       index: teamIndex,
//       behavior: 'smooth',
//       align: 'start',
//     });
//   }
//
//   useEffect(() => {
//     if (scrollToTeamRequest) {
//       handleScrollToTeam(scrollToTeamRequest);
//     }
//   }, [scrollToTeamRequest]);
//
//   return (
//     <Paper elevation={3} id="HostFilterPaper" sx={hostFilterPaperStyles} ref={teamsFilterContainerRef}>
//       <TitleBar onToggleMinize={handleMinimizeFilterView} title={t('common:filter')} actionButtton={<ResetAllButton />} />
//       <Box sx={{ height: `${teamsFilterHeight}px`, pt: 3, px: 3, pb: 1 }}>
//         <Box pb={1}>
//           <Span i18n="admin:hostlocations_team_filter" />
//         </Box>
//         <Virtuoso ref={virtuosoRef} data={dinnerRouteMapEntries} style={{ height: '92%' }} itemContent={(_, team) => <FilterTeamCheckbox team={team} />}></Virtuoso>
//       </Box>
//       <TeamDisplayOptions />
//       <FilterAfterPartyLocationCheckbox />
//     </Paper>
//   );
// }
//
// type FilterTeamCheckboxProps = {
//   team: DinnerRouteTeamMapEntry;
// };
//
// function FilterTeamCheckbox({ team }: FilterTeamCheckboxProps) {
//   const { t } = useTranslation('admin');
//
//   const { state, dispatch } = useDinnerRouteOverviewContext();
//   const { activeTeamsFilter } = state;
//
//   const selected = !!activeTeamsFilter[team.teamNumber];
//
//   const isBigDevice = useIsBigDevice();
//
//   const { handleZoomTo } = useZoomToMarker();
//
//   const hostTeams = DinnerRouteMapCalculator.getHostTeamsOfDinnerRouteMapEntry(team);
//
//   function handleChange() {
//     dispatch({
//       type: DinnerRouteOverviewActionType.TOGGLE_ACTIVE_TEAM,
//       payload: team,
//     });
//     if (!selected) {
//       const geocodingResult = DinnerRouteMapCalculator.getGeocodingResult(team);
//       // User wants to explicitly see this team
//       handleZoomTo(geocodingResult);
//     }
//   }
//
//   return (
//     <>
//       <Box sx={{ mb: '-12px' }}>
//         <FormControlLabel sx={{ color: team.color }} label={getTeamLabel(team, isBigDevice)} control={<Checkbox color="primary" onChange={handleChange} checked={selected} />} />
//       </Box>
//
//       {isBigDevice && (
//         <Box sx={{ pl: 4 }}>
//           {hostTeams.map((hostTeam) => (
//             <Box key={hostTeam.teamNumber}>
//               <small>
//                 {t('admin:dinner_route_filter_team_guest_info_prefix')} {getTeamLabel(hostTeam, false)}
//               </small>
//             </Box>
//           ))}
//         </Box>
//       )}
//     </>
//   );
// }
//
// function TeamDisplayOptions() {
//   const { t } = useTranslation('admin');
//   const { dispatch, state } = useDinnerRouteOverviewContext();
//
//   function onToggleShowTeamClusters(showTeamClusters: boolean) {
//     dispatch({
//       type: DinnerRouteOverviewActionType.TOGGLE_SHOW_TEAM_CLUSTERS,
//       payload: showTeamClusters,
//     });
//   }
//
//   function onToggleShowTeamPaths(showTeamPaths: boolean) {
//     dispatch({
//       type: DinnerRouteOverviewActionType.TOGGLE_SHOW_TEAM_PATHS,
//       payload: showTeamPaths,
//     });
//   }
//
//   return (
//     <Box sx={{ pl: 3 }}>
//       <Box>
//         <FormGroup>
//           <FormControlLabel
//             control={<Switch onChange={(evt) => onToggleShowTeamClusters(evt.target.checked)} checked={state.showTeamClusters} />}
//             label={t('admin:hostlocations_team_cluster_view_enable')}
//           />
//         </FormGroup>
//       </Box>
//       <Box>
//         <FormGroup>
//           <FormControlLabel
//             control={<Switch onChange={(evt) => onToggleShowTeamPaths(evt.target.checked)} checked={state.showTeamPaths} />}
//             label={t('admin:hostlocations_team_connections_enable')}
//           />
//         </FormGroup>
//       </Box>
//     </Box>
//   );
// }
//
// function FilterAfterPartyLocationCheckbox() {
//   const { dispatch, state } = useDinnerRouteOverviewContext();
//   const { excludeAfterPartyLocation, afterPartyLocation } = state;
//
//   const { t } = useTranslation('admin');
//
//   function handleToggleExcludeAfterPartyLocation() {
//     dispatch({
//       type: DinnerRouteOverviewActionType.TOGGLE_EXCLUDE_AFTER_PARTY_LOCATION,
//     });
//   }
//
//   if (!isAfterPartyLocationDefined(afterPartyLocation)) {
//     return null;
//   }
//
//   return (
//     <Box sx={{ pl: 3, mb: 1 }}>
//       <FormGroup>
//         <FormControlLabel
//           control={<Switch onChange={handleToggleExcludeAfterPartyLocation} checked={!excludeAfterPartyLocation} />}
//           label={t('admin:dinner_route_show_after_party_location', { location: afterPartyLocation?.title })}
//         />
//       </FormGroup>
//     </Box>
//   );
// }
//
// function ResetAllButton() {
//   const { dispatch } = useDinnerRouteOverviewContext();
//
//   const { t } = useTranslation(['admin', 'common']);
//   const isMobileDevice = useIsMobileDevice();
//
//   function handleReset() {
//     dispatch({
//       type: DinnerRouteOverviewActionType.RESET,
//     });
//   }
//
//   return (
//     <Button variant="outlined" sx={{ mr: 2 }} color="inherit" size="small" onClick={handleReset}>
//       {t(isMobileDevice ? 'common:reset' : 'admin:dinner_route_filter_reset')}
//     </Button>
//   );
// }
