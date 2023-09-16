import React from "react";
import {Box, Button, Grid, Paper, Popover, useMediaQuery, useTheme} from "@mui/material";
import orderBy from 'lodash/orderBy';
import Paragraph from "../../common/theme/typography/Paragraph";
import {SmallTitle, Span, Title} from "../../common/theme/typography/Tags";
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import {useTranslation} from "react-i18next";
import {bindPopover, bindTrigger, usePopupState,} from 'material-ui-popup-state/hooks';
import LinkIntern from "../../common/theme/LinkIntern";
import LinkExtern from "../../common/theme/LinkExtern";
import {PrimaryDangerButtonAsync} from "../../common/theme/PrimaryDangerButtonAsync";
import {
  Fullname,
  isSameEntity,
  Time,
  CONSTANTS,
  TeamNr,
  getAsHttpErrorOrDefault
} from "@runningdinner/shared";
import {useAdminNavigation} from "../AdminNavigationHook";
import {GENERIC_HTTP_ERROR} from "@runningdinner/shared/src/redux";
import {ProgressBar} from "../../common/ProgressBar";
import {styled} from "@mui/material/styles";
import {commonStyles} from "../../common/theme/CommonStyles";

const GridContentRight = styled(Grid)({
  textAlign: 'right'
});
const GridContentCenter = styled(Grid)({
  textAlign: 'center'
});
const ScheduleRowTimeLineBox = styled(Box)(({theme}) => ({
  height: '48px',
  width: '1px',
  margin: '0 auto',
  borderRight: '2px solid',
  borderRightColor: theme.palette.primary.main,
}));
const SchedulePaper = styled(Paper)(({theme}) => ({
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1),
  },
  textAlign: 'center',
  borderColor: theme.palette.primary.main,
  borderWidth: '1px',
  borderStyle: 'solid'
}));
const hostTeamMemberCancelledPaperStyles = {
  backgroundColor: (theme) => theme.palette.secondary.main,
  color: 'white',
  borderColor: (theme) => theme.palette.secondary.main
};
const highlightedMealPaperStyles = {
  backgroundColor: (theme) => theme.palette.primary.main,
  color: 'white'
};

const buildScheduledMealsWithTeams = (teamMeetingPlan) => {

  const activeTeam = teamMeetingPlan.team;

  let result = teamMeetingPlan.hostTeams
                                .map((hostTeam) => { return {meal: hostTeam.meal, hostTeam: hostTeam, current: false, guestTeams: hostTeam.meetedTeams.concat(activeTeam)} });
  result.push({ meal: teamMeetingPlan.team.meal, hostTeam: teamMeetingPlan.team, current: true, guestTeams: teamMeetingPlan.guestTeams});
  result = orderBy(result, 'meal.time');
  return result;
};

export default function TeamSchedule({adminId, isTeamMeetingPlanLoading, teamMeetingPlanResult, teamMeetingPlanError}) {
  if (isTeamMeetingPlanLoading || teamMeetingPlanError) {
    const httpFetchError = teamMeetingPlanError ? getAsHttpErrorOrDefault(teamMeetingPlanError, GENERIC_HTTP_ERROR) : undefined;
    return <ProgressBar showLoadingProgress={isTeamMeetingPlanLoading} fetchError={httpFetchError} />;
  } else {
    return <TeamScheduleView teamMeetingPlan={teamMeetingPlanResult} adminId={adminId} />
  }
}

function TeamScheduleView({teamMeetingPlan, adminId}) {

  const {t} = useTranslation('admin');
  const {generateTeamDinnerRoutePath} = useAdminNavigation();

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  const scheduleItems = buildScheduledMealsWithTeams(teamMeetingPlan);
  const activeTeam = teamMeetingPlan.team;

  const xs = 4, md = 4, spacing = 3;

  const renderScheduleRowHeading = () => {
    return (
      <Grid container spacing={spacing} justifyContent={"center"} alignItems={"center"}>
        <GridContentRight item xs={xs} md={md}><Title i18n='common:host' /></GridContentRight>
        <GridContentCenter item xs={xs} md={md}><Title i18n='common:meal' /></GridContentCenter>
        <GridContentCenter item xs={xs} md={md}><Title i18n='common:guests' /></GridContentCenter>
      </Grid>
    );
  };

  const renderScheduleRowLinkToRoute = () => {

    const isCancelled = activeTeam.status === CONSTANTS.TEAM_STATUS.CANCELLED;
    if (isCancelled) {
      return null;
    }
    return (
      <Grid container spacing={spacing} justifyContent={"center"} alignItems={"center"}>
        {!isMobileDevice && <GridContentRight item xs={xs} md={md} />}
        <GridContentCenter item xs={12} md={md}>
          <Box mt={1}>
            <LinkExtern href={generateTeamDinnerRoutePath(adminId, activeTeam.id)} title={t('teams_show_dinnerroute')}/>
          </Box>
        </GridContentCenter>
        {!isMobileDevice && <GridContentCenter item xs={xs} md={md} />}
      </Grid>
    );
  };

  const renderScheduledMealRow = (scheduledMeal) => {
    return (
      <Grid container spacing={spacing} justifyContent={"center"} alignItems={"center"} key={scheduledMeal.meal.id}>
        <ScheduledMeal {...scheduledMeal} currentTeam={activeTeam} xs={xs} md={md} adminId={adminId} />
      </Grid>
    );
  };

  const renderTimelineRow = (index) => {
    return (
      <Grid container spacing={spacing} justifyContent={"center"} alignItems={"center"} key={index}>
        <ScheduledMealTimeline xs={xs} md={md} />
      </Grid>
    );
  };

  const resultRows = [];
  for (let i = 0; i < scheduleItems.length; i++) {
    const scheduleItem = scheduleItems[i];
    if (i > 0) {
      resultRows.push(renderTimelineRow(i));
    }
    resultRows.push(renderScheduledMealRow(scheduleItem));
  }

  return (
      <>
        {renderScheduleRowHeading()}
        {resultRows}
        {renderScheduleRowLinkToRoute()}
      </>
  );
}

function ScheduledMeal({hostTeam, meal, guestTeams, currentTeam, xs, md, adminId}) {

  const activeMeal = currentTeam.meal;
  const highlightMeal = isSameEntity(activeMeal, meal);
  const highlightHostTeam = isSameEntity(currentTeam, hostTeam);

  const hostTeamIsCancelled = hostTeam.status === CONSTANTS.TEAM_STATUS.CANCELLED;

  const renderGuestTems = () => {
    const guestTeamNodes = [];
    for (let i = 0; i < guestTeams.length; i++) {
      const guestTeam = guestTeams[i];
      const guestTeamNode = isSameEntity(guestTeam, currentTeam) ? <CurrentTeamButton team={guestTeam} /> : <MeetedTeamButton team={guestTeam} adminId={adminId}/>;
      if (i > 0) {
        guestTeamNodes.push(<Box key={guestTeam.id} mt={1}>{guestTeamNode}</Box>);
      } else {
        guestTeamNodes.push(<Box key={guestTeam.id}>{guestTeamNode}</Box>);
      }
    }
    return guestTeamNodes;
  };

  function getSchedulePaperStyles(highlightMeal, hostTeamIsCancelled) {
    if (highlightMeal && !hostTeamIsCancelled) {
      return highlightedMealPaperStyles;
    } else if (hostTeamIsCancelled) {
      return hostTeamMemberCancelledPaperStyles;
    }
    return undefined;
  }

  return (
    <>
      <GridContentRight item xs={xs} md={md}>
        { highlightHostTeam ? <CurrentTeamButton team={hostTeam}/> : <MeetedTeamButton team={hostTeam} adminId={adminId} /> }
      </GridContentRight>
      <Grid item xs={xs} md={md}>
        <SchedulePaper elevation={3} sx={getSchedulePaperStyles(highlightMeal, hostTeamIsCancelled)}>
          <SmallTitle>{meal.label}</SmallTitle>
          <Paragraph><Time date={meal.time} /></Paragraph>
        </SchedulePaper>
      </Grid>
      <GridContentCenter item xs={xs} md={md}>
        { renderGuestTems() }
      </GridContentCenter>
    </>
  );
}

function MeetedTeamButton({team, adminId}) {

  const popupState = usePopupState({
    variant: 'popover',
    popupId: team.id,
  });

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  const { teamMembers, teamNumber, id } = team;
  const teamMemberNodes = isCancelled ? null : teamMembers.map(participant => <Span key={participant.id}><Fullname {...participant} /></Span>);

  const {generateTeamPath} = useAdminNavigation();
  const teamPath = generateTeamPath(adminId, id);

  return (
    <>
      { !isCancelled && <Button variant="outlined" size="medium" {...bindTrigger(popupState)}><TeamNr {...team} /></Button> }
      { isCancelled && <PrimaryDangerButtonAsync variant="outlined" size="medium" {...bindTrigger(popupState)}><TeamNr {...team} /></PrimaryDangerButtonAsync> }
      <Popover
          {...bindPopover(popupState)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}>
        <Box p={2}>
          <Title><TeamNr {...team} /></Title>
          <Paragraph>{team.meal.label}</Paragraph>
          <Box mt={1}>
            {teamMemberNodes}
          </Box>
          <Box mt={1}>
            <LinkIntern pathname={teamPath}>
              <SmallTitle i18n='admin:team_jump_link' parameters={{ teamNumber: teamNumber}} />
            </LinkIntern>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

function CurrentTeamButton({team}) {

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  return (
      <>
        { isCancelled
            ? <PrimaryDangerButtonAsync size="medium" variant="contained" sx={commonStyles.defaultCursor} disableRipple={true} disableElevation={true}>
                <TeamNr {...team} />
              </PrimaryDangerButtonAsync>
            : <PrimaryButton variant="contained" sx={commonStyles.defaultCursor} disableRipple={true} disableElevation={true}>
                <TeamNr {...team} />
              </PrimaryButton>
        }
      </>
   );
}

/**
 * Hack for drawing a line between the single meal schedule items
 * @param xs
 * @param md
 * @returns {*}
 * @constructor
 */
function ScheduledMealTimeline({xs, md}) {

  return (
    <>
      <Grid item xs={xs} md={md} />
      <GridContentCenter item xs={xs} md={md}>
        <ScheduleRowTimeLineBox />
      </GridContentCenter>
      <Grid item xs={xs} md={md} />
    </>
  );
}
