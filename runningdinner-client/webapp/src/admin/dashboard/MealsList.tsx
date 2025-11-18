import { Box, Card, CardActions, CardContent, Grid, List } from '@mui/material';
import { BaseRunningDinnerProps, DashboardAdminActivities, Meal, RunningDinner } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import { PrimaryButton } from '../../common/theme/PrimaryButton';
import { Subtitle } from '../../common/theme/typography/Tags';
import { EditMealsDialog } from './EditMealsDialog';
import MealItem from './MealItem';

export interface MealsListProps extends BaseRunningDinnerProps {
  meals: Meal[];
  dashboardAdminActivities: DashboardAdminActivities;
  onRunningDinnerUpdate: (runningDinner: RunningDinner) => unknown;
}

export default function MealsList({ meals, runningDinner, onRunningDinnerUpdate, dashboardAdminActivities }: MealsListProps) {
  const { showSuccess } = useCustomSnackbar();
  const { adminId } = runningDinner;

  const mealItems = meals.map((meal) => <MealItem {...meal} key={meal.id} />);

  const [editMealsDialogOpen, setEditMealsDialogOpen] = React.useState(false);

  const { t } = useTranslation(['admin', 'common']);

  function handleMealsUpdated(updatedRunningDinner: RunningDinner) {
    onRunningDinnerUpdate(updatedRunningDinner);
    setEditMealsDialogOpen(false);
    showSuccess(t('admin:mealtimes_save_success'));
  }

  return (
    <Card>
      <CardContent>
        <Subtitle i18n="admin:time_schedule" />
        <div>{<List dense={true}>{mealItems}</List>}</div>
      </CardContent>
      <CardActions>
        <Grid container justifyContent={'flex-end'}>
          <Grid item>
            <Box pr={2} mt={-2} pb={2}>
              <PrimaryButton onClick={() => setEditMealsDialogOpen(true)} size={'small'} data-testid="open-edit-meals-action">
                {t('common:label_edit')}
              </PrimaryButton>
            </Box>
          </Grid>
        </Grid>
      </CardActions>

      <EditMealsDialog
        open={editMealsDialogOpen}
        dashboardAdminActivities={dashboardAdminActivities}
        runningDinnerDate={runningDinner.basicDetails.date}
        onMealsUpdated={(updatedRunningDinner) => handleMealsUpdated(updatedRunningDinner)}
        incomingMeals={meals}
        adminId={adminId}
        onCancel={() => setEditMealsDialogOpen(false)}
      />
    </Card>
  );
}
