import { Box, Grid, Paper, Typography } from '@mui/material';
import { DinnerRoute, DinnerRouteMapCalculator, DinnerRouteTeam, isAfterPartyLocationDefined, isStringNotEmpty, Meal, MealType, TeamStatus } from '@runningdinner/shared';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useTranslation } from 'react-i18next';
import { SuperSEO } from 'react-super-seo';

import { GOOGLE_MAPS_KEY } from '../maps';
import { TextViewHtml } from '../TextViewHtml';
import { PageTitle, Subtitle } from '../theme/typography/Tags';
import { AfterPartyLocationCard, getMealTypeIcon, TeamCardDetails } from './DinnerRouteComponents';
import { DinnerRouteMapView } from './DinnerRouteMapView';

export interface DinnerRouteProps {
  dinnerRoute: DinnerRoute;
  meals: Meal[];
}

export default function DinnerRouteView({ dinnerRoute, meals }: DinnerRouteProps) {
  const { mealSpecificsOfGuestTeams, teams, afterPartyLocation } = dinnerRoute;

  const mealTypeMappings = DinnerRouteMapCalculator.buildMealTypeMappings(meals);

  const teamCardNodes = teams.map((team) => (
    <Grid
      key={team.teamNumber}
      size={{
        xs: 12,
        md: 4,
      }}
    >
      <TeamCard dinnerRouteTeam={team} isCurrentTeam={team.teamNumber === dinnerRoute.currentTeam.teamNumber} mealType={mealTypeMappings[team.meal.id || '']} />
    </Grid>
  ));

  return (
    <>
      <Grid container>
        {isStringNotEmpty(mealSpecificsOfGuestTeams) && (
          <Grid sx={{ mb: 2 }} size={12}>
            <Subtitle>
              <TextViewHtml text={mealSpecificsOfGuestTeams} />
            </Subtitle>
          </Grid>
        )}
        <Grid container spacing={4} size={12} sx={{ mb: 4 }}>
          {teamCardNodes}
        </Grid>
        {afterPartyLocation && isAfterPartyLocationDefined(afterPartyLocation) && (
          <Grid container spacing={4} sx={{ mb: 1 }}>
            <Grid size={12}>
              <AfterPartyLocationCard {...afterPartyLocation} />
            </Grid>
          </Grid>
        )}
        <Grid sx={{ mb: 2 }} size={12}>
          <APIProvider apiKey={GOOGLE_MAPS_KEY}>
            <DinnerRouteMapView dinnerRoute={dinnerRoute} meals={meals} />
          </APIProvider>
        </Grid>
      </Grid>
      <SuperSEO title={'Run Your Dinner - Dinner Route'} />
    </>
  );
}

interface TeamCardProps {
  dinnerRouteTeam: DinnerRouteTeam;
  mealType: MealType;
  isCurrentTeam: boolean;
}

function TeamCard({ dinnerRouteTeam, mealType, isCurrentTeam }: TeamCardProps) {
  const { t } = useTranslation(['common']);
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;

  let teamTitleColor = isCurrentTeam ? 'primary' : 'textSecondary';
  if (isCancelled) {
    teamTitleColor = 'error';
  }

  return (
    <>
      <PageTitle color={teamTitleColor}>
        {getMealTypeIcon(mealType, 24)} {dinnerRouteTeam.meal.label}
        {isCurrentTeam && (
          <Box component={'span'} pl={1}>
            <Typography variant={'body2'} component={'span'}>
              {t('common:with_you')}
            </Typography>
          </Box>
        )}
      </PageTitle>
      <Paper elevation={3} sx={{ p: 2 }}>
        {isCancelled && <Subtitle i18n={'cancelled'} color="error" />}
        {!isCancelled && <TeamCardDetails {...dinnerRouteTeam} isCurrentTeam={isCurrentTeam} />}
      </Paper>
    </>
  );
}
