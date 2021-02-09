import React from "react";
import { Fetch } from "../../common/Fetch";
import {Box, Button, Grid, makeStyles, Paper, Popover} from "@material-ui/core";
import sortBy from 'lodash/sortBy';
import Paragraph from "../../common/theme/typography/Paragraph";
import {SmallTitle, Span, Title} from "../../common/theme/typography/Tags";
import clsx from "clsx";
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import {useTranslation} from "react-i18next";
import {bindPopover, bindTrigger, usePopupState,} from 'material-ui-popup-state/hooks';
import LinkIntern from "../../common/theme/LinkIntern";
import LinkExtern from "../../common/theme/LinkExtern";
import {generateTeamPath} from "../../common/NavigationService";
import {PrimaryDangerButtonAsync} from "../../common/theme/PrimaryDangerButtonAsync";
import Hidden from "@material-ui/core/Hidden";
import {findTeamMeetingPlanAsync, Fullname, isSameEntity, Time, CONSTANTS, TeamNr} from "@runningdinner/shared";

const useStyles = makeStyles((theme) => ({
  schedulePaper: {
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(1),
    },
    textAlign: 'center',
    borderColor: theme.palette.primary.main,
    borderWidth: '1px',
    borderStyle: 'solid'
  },
  schedulePaperActive: {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  },
  schedulePaperActiveDanger: {
    backgroundColor: theme.palette.secondary.main,
    color: 'white',
    borderColor: theme.palette.secondary.main,
  },
  scheduleRowHostTeam: {
    textAlign: 'right'
  },
  scheduleRowGuestTeams: {
    textAlign: 'center'
  },
  scheduleRowTimeLine: {
    // paddingTop: '0px', // Is unfortunately overridden by Grid (thus I use inline styling...)
    // paddingBottom: '0px',
    textAlign: 'center'
  },
  scheduleRowTimeLineBox: {
    height: '48px',
    width: '1px',
    margin: '0 auto',
    borderColor: theme.palette.primary.main
  },
  currentTeamButton: {
    cursor: 'default'
  }
}));


const buildScheduledMealsWithTeams = (teamMeetingPlan) => {

  const activeTeam = teamMeetingPlan.team;

  let result = teamMeetingPlan.hostTeams
                                .map((hostTeam) => { return {meal: hostTeam.meal, hostTeam: hostTeam, current: false, guestTeams: hostTeam.meetedTeams.concat(activeTeam)} });
  result.push(
      { meal: teamMeetingPlan.team.meal, hostTeam: teamMeetingPlan.team, current: true, guestTeams: teamMeetingPlan.guestTeams}
  );
  result = sortBy(result, 'meal.time');
  return result;
};

export default function TeamSchedule({team, adminId}) {

  const teamId = team.id;

  return <Fetch asyncFunction={findTeamMeetingPlanAsync}
                parameters={[adminId, teamId]}
                render={resultObj => <TeamScheduleView teamMeetingPlan={resultObj.result} adminId={adminId} />} />;
}


function TeamScheduleView({teamMeetingPlan, adminId}) {

  const classes = useStyles();
  const {t} = useTranslation('admin');

  const scheduleItems = buildScheduledMealsWithTeams(teamMeetingPlan);
  const activeTeam = teamMeetingPlan.team;

  const xs = 4, md = 4, spacing = 3;

  const renderScheduleRowHeading = () => {
    return (
      <Grid container spacing={spacing} justify={"center"} alignItems={"center"}>
        <Grid item xs={xs} md={md} className={classes.scheduleRowHostTeam}><Title i18n='common:host' /></Grid>
        <Grid item xs={xs} md={md} className={classes.scheduleRowGuestTeams}><Title i18n='common:meal' /></Grid>
        <Grid item xs={xs} md={md} className={classes.scheduleRowGuestTeams}><Title i18n='common:guests' /></Grid>
      </Grid>
    );
  };

  const renderScheduleRowLinkToRoute = () => {

    const isCancelled = activeTeam.status === CONSTANTS.TEAM_STATUS.CANCELLED;
    if (isCancelled) {
      return null;
    }
    return (
        <Grid container spacing={spacing} justify={"center"} alignItems={"center"}>
          <Hidden xsDown>
            <Grid item xs={xs} md={md} className={classes.scheduleRowHostTeam} />
          </Hidden>
          <Grid item xs={12} md={md} className={classes.scheduleRowGuestTeams}>
            <Box mt={1}>
              <LinkExtern href="https://www.google.de" title={t('teams_show_dinnerroute')}/>
            </Box>
          </Grid>
          <Hidden xsDown>
            <Grid item xs={xs} md={md} className={classes.scheduleRowGuestTeams} />
          </Hidden>
        </Grid>
    );
  };

  const renderScheduledMealRow = (scheduledMeal) => {
    return (
      <Grid container spacing={spacing} justify={"center"} alignItems={"center"} key={scheduledMeal.meal.id}>
        <ScheduledMeal {...scheduledMeal} currentTeam={activeTeam} xs={xs} md={md} adminId={adminId} />
      </Grid>
    );
  };

  const renderTimelineRow = (index) => {
    return (
        <Grid container spacing={spacing} justify={"center"} alignItems={"center"} key={index}>
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

  const classes = useStyles();
  return (
    <>
      <Grid item xs={xs} md={md} className={classes.scheduleRowHostTeam}>
        { highlightHostTeam ? <CurrentTeamButton team={hostTeam}/> : <MeetedTeamButton team={hostTeam} adminId={adminId} /> }
      </Grid>
      <Grid item xs={xs} md={md}>
        <Paper elevation={3}
               className={clsx(classes.schedulePaper, (highlightMeal && !hostTeamIsCancelled) && classes.schedulePaperActive, hostTeamIsCancelled && classes.schedulePaperActiveDanger)}>
          <SmallTitle>{meal.label}</SmallTitle>
          <Paragraph><Time date={meal.time} /></Paragraph>
        </Paper>
      </Grid>
      <Grid item xs={xs} md={md} className={classes.scheduleRowGuestTeams}>
        { renderGuestTems() }
      </Grid>
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
  const classes = useStyles();
  return (
      <>
        { isCancelled
            ? <PrimaryDangerButtonAsync size="medium" variant="contained" className={classes.currentTeamButton} disableRipple={true} disableElevation={true}>
                <TeamNr {...team} />
              </PrimaryDangerButtonAsync>
            : <PrimaryButton variant="contained" className={classes.currentTeamButton} disableRipple={true} disableElevation={true}>
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

  const classes = useStyles();
  return (
    <>
      <Grid item xs={xs} md={md} />
      <Grid item xs={xs} md={md} className={classes.scheduleRowTimeLine} style={{ paddingTop: '0px', paddingBottom: '0px'}}>
        <Box borderRight={2} className={classes.scheduleRowTimeLineBox} />
      </Grid>
      <Grid item xs={xs} md={md} />
    </>
  );
}
