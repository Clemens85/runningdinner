import React from 'react';
import {DinnerRoute, DinnerRouteTeam, Fullname, isStringNotEmpty, TeamStatus, Time} from "@runningdinner/shared";
import {Paper} from '@material-ui/core';
import {SpacingGrid} from '../theme/SpacingGrid';
import {PageTitle, SmallTitle, Span, Subtitle} from '../theme/typography/Tags';
import {useTranslation} from "react-i18next";

export interface DinnerRouteProps {
  dinnerRoute: DinnerRoute
}

export default function DinnerRouteView({dinnerRoute}: DinnerRouteProps) {

  const {mealSpecificsOfGuestTeams, teams} = dinnerRoute;

  const teamCardNodes = teams.map((team, index) =>
    <TeamCard dinnerRouteTeam={team}
              isCurrentTeam={team.teamNumber === dinnerRoute.currentTeam.teamNumber}
              positionInRoute={index + 1}/>
  );

  return (
      <SpacingGrid container>
        { isStringNotEmpty(mealSpecificsOfGuestTeams) &&
          <SpacingGrid item xs={12} mb={2}>
            <Subtitle>{mealSpecificsOfGuestTeams}</Subtitle>
          </SpacingGrid>
        }
        <SpacingGrid item xs={12} mb={2}>
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

function TeamCard({dinnerRouteTeam, positionInRoute, isCurrentTeam}: TeamCardProps) {

  const {t} = useTranslation(['common']);
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;
  const {hostTeamMember} = dinnerRouteTeam;

  return (
    <>
      <PageTitle>
        ({positionInRoute}) {dinnerRouteTeam.meal.label}
        { isCurrentTeam && <small>{t('with_you')}</small> }
      </PageTitle>
      <Paper>
        {isCancelled && <Subtitle i18n={"cancelled"} />}
        {!isCancelled && (
         <>
           <SmallTitle i18n="host"/>: <Span><Fullname {...hostTeamMember} /></Span>
           <address>
             <SmallTitle i18n="address"/><br />
             <Span>{hostTeamMember.street}</Span> <Span>{hostTeamMember.streetNr}</Span><br />
             <Span>{hostTeamMember.zip}</Span> <Span>{hostTeamMember.cityName}</Span><br />
             { isStringNotEmpty(hostTeamMember.addressRemarks) && <em>{hostTeamMember.addressRemarks}</em> }
           </address>
           <SmallTitle i18n="time"/>: <Span><Time date={dinnerRouteTeam.meal.time }/></Span>
         </>
        )}
      </Paper>
    </>
  );
}


function Map() {
  return (
      <div>TODO</div>
  );
}
