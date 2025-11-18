import { Checkbox, FormControlLabel, FormGroup, Switch } from '@mui/material';
import { Box } from '@mui/system';
import {
  DinnerRouteMapCalculator,
  DinnerRouteOverviewActionType,
  DinnerRouteTeamMapEntry,
  isAfterPartyLocationDefined,
  useDinnerRouteOverviewContext,
} from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { getTeamLabel } from '../../common/dinnerroute';
import { useIsBigDevice } from '../../common/theme/CustomMediaQueryHook';
import { Span } from '../../common/theme/typography/Tags';
import { useZoomToMarker } from './useZoomToMarker';

type FilterTeamCheckboxProps = {
  team: DinnerRouteTeamMapEntry;
};

function FilterTeamCheckbox({ team }: FilterTeamCheckboxProps) {
  const { t } = useTranslation('admin');

  const { state, dispatch } = useDinnerRouteOverviewContext();
  const { activeTeamsFilter } = state;

  const selected = !!activeTeamsFilter[team.teamNumber];

  const isBigDevice = useIsBigDevice();

  const { handleZoomTo } = useZoomToMarker();

  const hostTeams = DinnerRouteMapCalculator.getHostTeamsOfDinnerRouteMapEntry(team);

  function handleChange() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_ACTIVE_TEAM,
      payload: team,
    });
    if (!selected) {
      const geocodingResult = DinnerRouteMapCalculator.getGeocodingResult(team);
      // User wants to explicitly see this team
      handleZoomTo(geocodingResult);
    }
  }

  return (
    <>
      <Box sx={{ mb: '-12px' }}>
        <FormControlLabel sx={{ color: team.color }} label={getTeamLabel(team, isBigDevice)} control={<Checkbox color="primary" onChange={handleChange} checked={selected} />} />
      </Box>

      {isBigDevice && (
        <Box sx={{ pl: 4 }}>
          {hostTeams.map((hostTeam) => (
            <Box key={hostTeam.teamNumber}>
              <small>
                {t('admin:dinner_route_filter_team_guest_info_prefix')} {getTeamLabel(hostTeam, false)}
              </small>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}

function FilterAfterPartyLocationCheckbox() {
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { excludeAfterPartyLocation, afterPartyLocation } = state;

  const { t } = useTranslation('admin');

  function handleToggleExcludeAfterPartyLocation() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_EXCLUDE_AFTER_PARTY_LOCATION,
    });
  }

  if (!isAfterPartyLocationDefined(afterPartyLocation)) {
    return null;
  }

  return (
    <Box sx={{ my: 1 }}>
      <FormGroup>
        <FormControlLabel
          control={<Switch onChange={handleToggleExcludeAfterPartyLocation} checked={!excludeAfterPartyLocation} />}
          label={t('admin:dinner_route_show_after_party_location', { location: afterPartyLocation?.title })}
        />
      </FormGroup>
    </Box>
  );
}

type TeamLocationsFilterListProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
};

export function TeamLocationsFilterList({ dinnerRouteMapEntries }: TeamLocationsFilterListProps) {
  // const { state } = useDinnerRouteOverviewContext();
  // const { scrollToTeamRequest } = state;

  // const virtuosoRef = useRef<VirtuosoHandle>(null);

  // TODO: Will not work any longer...
  // function handleScrollToTeam(scrollToTeamWithNumber: number) {
  // if (!virtuosoRef.current) {
  //   return;
  // }

  // let teamIndex = -1;
  // for (let i = 0; i < dinnerRouteMapEntries.length; i++) {
  //   const team = dinnerRouteMapEntries[i];
  //   if (team.teamNumber === scrollToTeamWithNumber) {
  //     teamIndex = i;
  //     break;
  //   }
  // }
  // if (teamIndex < 0) {
  //   return;
  // }

  // virtuosoRef.current.scrollToIndex({
  //   index: teamIndex,
  //   behavior: 'smooth',
  //   align: 'start',
  // });
  // }

  // useEffect(() => {
  //   if (scrollToTeamRequest) {
  //     handleScrollToTeam(scrollToTeamRequest);
  //   }
  // }, [scrollToTeamRequest]);

  return (
    <Box>
      <Box pb={1}>
        <Span i18n="admin:hostlocations_team_filter" />
      </Box>
      {dinnerRouteMapEntries.map((team) => (
        <FilterTeamCheckbox key={team.teamNumber} team={team} />
      ))}
      <FilterAfterPartyLocationCheckbox />
    </Box>
  );
}
