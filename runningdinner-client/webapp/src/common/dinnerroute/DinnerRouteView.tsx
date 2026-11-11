import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import {
  DinnerRoute,
  DinnerRouteMapCalculator,
  DinnerRouteTeam,
  isAfterPartyLocationDefined,
  isStringNotEmpty,
  Meal,
  MealType,
  TeamLabel,
  TeamLabelFormat,
  TeamStatus,
} from '@runningdinner/shared';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useTranslation } from 'react-i18next';

import { GOOGLE_MAPS_KEY } from '../maps';
import { TextViewHtml } from '../TextViewHtml';
import { Subtitle } from '../theme/typography/Tags';
import { AfterPartyLocationCard, DINNER_ROUTE_TEAM_NAME_MAX_LENGTH, getMealTypeIcon, TeamCardDetails } from './DinnerRouteComponents';
import { DinnerRouteMapView } from './DinnerRouteMapView';

export interface DinnerRouteProps {
  dinnerRoute: DinnerRoute;
  meals: Meal[];
}

export default function DinnerRouteView({ dinnerRoute, meals }: DinnerRouteProps) {
  const { mealSpecificsOfGuestTeams, teams, afterPartyLocation } = dinnerRoute;

  const mealTypeMappings = DinnerRouteMapCalculator.buildMealTypeMappings(meals);
  const currentTeamRequiresAccessibility = dinnerRoute.currentTeam.teamMembers.some((member) => member.requiresAccessibleHome);

  const teamCardNodes = teams.map((team) => (
    <Grid
      key={team.teamNumber}
      size={{
        xs: 12,
        md: 4,
      }}
    >
      <TeamCard
        dinnerRouteTeam={team}
        isCurrentTeam={team.teamNumber === dinnerRoute.currentTeam.teamNumber}
        currentTeamRequiresAccessibility={currentTeamRequiresAccessibility}
        mealType={mealTypeMappings[team.meal.id || '']}
      />
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
      <title>Run Your Dinner - Dinner Route</title>
    </>
  );
}

interface TeamCardProps {
  dinnerRouteTeam: DinnerRouteTeam;
  mealType: MealType;
  isCurrentTeam: boolean;
  currentTeamRequiresAccessibility: boolean;
}

function TeamCard({ dinnerRouteTeam, mealType, isCurrentTeam, currentTeamRequiresAccessibility }: TeamCardProps) {
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;

  return (
    <>
      <TeamCardTitle dinnerRouteTeam={dinnerRouteTeam} mealType={mealType} isCurrentTeam={isCurrentTeam} />
      <Paper elevation={3} sx={{ p: 2 }}>
        {isCancelled && <Subtitle i18n={'cancelled'} color="error" />}
        {!isCancelled && <TeamCardDetails {...dinnerRouteTeam} isCurrentTeam={isCurrentTeam} showAccessibleStop={currentTeamRequiresAccessibility} />}
      </Paper>
    </>
  );
}

type TeamCardTitleProps = Pick<TeamCardProps, 'dinnerRouteTeam' | 'mealType' | 'isCurrentTeam'>;

/**
 * The meal (with an indicator for the own team) is the headline, the team name (or number) is displayed in a separate line below it.
 * Both lines never wrap (long texts are shortened with an ellipsis), so that the cards look the same on mobile and desktop devices.
 */
function TeamCardTitle({ dinnerRouteTeam, mealType, isCurrentTeam }: TeamCardTitleProps) {
  const { t } = useTranslation(['common']);
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;

  let color = isCurrentTeam ? 'primary.main' : 'text.secondary';
  if (isCancelled) {
    color = 'error.main';
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color, minWidth: 0 }}>
        <Box sx={{ display: 'inline-flex', flexShrink: 0 }}>{getMealTypeIcon(mealType, 24)}</Box>
        <Typography variant="h5" component="h2" noWrap sx={{ minWidth: 0, color: 'inherit' }} title={dinnerRouteTeam.meal.label}>
          {dinnerRouteTeam.meal.label}
        </Typography>
        {isCurrentTeam && <Chip label={t('common:with_you')} size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />}
      </Stack>
      <Typography variant="h6" component="p" noWrap sx={{ color: isCancelled ? 'error.main' : 'text.primary', fontWeight: 500, mt: 0.5 }}>
        <TeamLabel team={dinnerRouteTeam} format={TeamLabelFormat.NUMBER_AND_NAME} maxNameLength={DINNER_ROUTE_TEAM_NAME_MAX_LENGTH} />
      </Typography>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}
