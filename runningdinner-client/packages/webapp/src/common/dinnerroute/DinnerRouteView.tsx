import React from 'react';
import {DinnerRoute, DinnerRouteTeam, Fullname, isStringNotEmpty, TeamStatus, Time} from "@runningdinner/shared";
import {Box, makeStyles, Typography} from '@material-ui/core';
import {SpacingGrid} from '../theme/SpacingGrid';
import {PageTitle, SmallTitle, Span, Subtitle} from '../theme/typography/Tags';
import {useTranslation} from "react-i18next";
import { SpacingPaper } from '../theme/SpacingPaper';
import clsx from "clsx";

export interface DinnerRouteProps {
  dinnerRoute: DinnerRoute
}

export default function DinnerRouteView({dinnerRoute}: DinnerRouteProps) {

  const {mealSpecificsOfGuestTeams, teams} = dinnerRoute;

  const teamCardNodes = teams.map((team, index) =>
    <SpacingGrid item xs={12} md={4} key={team.teamNumber}>
      <TeamCard dinnerRouteTeam={team}
                isCurrentTeam={team.teamNumber === dinnerRoute.currentTeam.teamNumber}
                positionInRoute={index + 1}/>
    </SpacingGrid>
  );

  return (
      <SpacingGrid container>
        { isStringNotEmpty(mealSpecificsOfGuestTeams) &&
          <SpacingGrid item xs={12} mb={2}>
            <Subtitle>{mealSpecificsOfGuestTeams}</Subtitle>
          </SpacingGrid>
        }
        <SpacingGrid container mb={2} spacing={4}>
          {teamCardNodes}
        </SpacingGrid>
        <SpacingGrid item xs={12} mb={2}>
          {/*<Map />*/}
          TODO
        </SpacingGrid>
      </SpacingGrid>
  );
}

interface TeamCardProps {
  dinnerRouteTeam: DinnerRouteTeam;
  positionInRoute: number;
  isCurrentTeam: boolean;
}


const useTeamCardStyles = makeStyles((theme) => ({
  teamCardLine: {
    display: 'flex',
    alignItems: 'baseline',
  },
  marginBottom: {
    marginBottom: theme.spacing(1)
  }
}));


function TeamCard({dinnerRouteTeam, positionInRoute, isCurrentTeam}: TeamCardProps) {

  const {t} = useTranslation(['common']);
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;
  const {hostTeamMember} = dinnerRouteTeam;
  const teamCardClasses = useTeamCardStyles();

  return (
    <>
      <PageTitle>
        ({positionInRoute}) {dinnerRouteTeam.meal.label}
        { isCurrentTeam && <Box component={"span"} pl={1}>
                              <Typography variant={"body2"} component={"span"}>{t('common:with_you')}</Typography>
                           </Box> }
      </PageTitle>
      <SpacingPaper elevation={3} p={2}>
        {isCancelled && <Subtitle i18n={"cancelled"} />}
        {!isCancelled && (
         <>
           <div className={clsx(teamCardClasses.teamCardLine, teamCardClasses.marginBottom)}>
             <SmallTitle i18n="host"/>:&nbsp; <Span><Fullname {...hostTeamMember} /></Span>
           </div>
           {/*<address>*/}
             <SmallTitle i18n="address" gutterBottom={false}/>
             <div className={teamCardClasses.teamCardLine}>
               <Span gutterBottom={false}>{hostTeamMember.street}</Span>&nbsp;<Span gutterBottom={false}>{hostTeamMember.streetNr}</Span>
             </div>
             <div className={clsx(teamCardClasses.teamCardLine, teamCardClasses.marginBottom)}>
               <Span>{hostTeamMember.zip}</Span>&nbsp;<Span>{hostTeamMember.cityName}</Span>
             </div>
             { isStringNotEmpty(hostTeamMember.addressRemarks) && <em>{hostTeamMember.addressRemarks}</em> }
           {/*</address>*/}
           <div className={teamCardClasses.teamCardLine}>
             <SmallTitle i18n="time"/>: &nbsp; <Span><Time date={dinnerRouteTeam.meal.time }/></Span>
           </div>
         </>
        )}
      </SpacingPaper>
    </>
  );
}


function Map() {
  return (
      <div>TODO</div>
  );
}
