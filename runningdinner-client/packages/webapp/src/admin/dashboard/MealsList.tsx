import React from 'react'
import MealItem from "./MealItem";
import {Box, Card, CardActions, CardContent, Grid, List} from "@mui/material";
import {EditMealsDialog} from "./EditMealsDialog";
import {useTranslation} from "react-i18next";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {Subtitle} from "../../common/theme/typography/Tags";
import {
  BaseRunningDinnerProps,
  DashboardAdminActivities,
  Meal,
  RunningDinner,
  updateMealTimesAsync,
  useBackendIssueHandler,
} from "@runningdinner/shared";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";

export interface MealsListProps extends BaseRunningDinnerProps {
  meals: Meal[];
  dashboardAdminActivities: DashboardAdminActivities
  onRunningDinnerUpdate: (runningDinner: RunningDinner) => unknown;
}

export default function MealsList({meals, runningDinner, onRunningDinnerUpdate, dashboardAdminActivities}: MealsListProps) {

  const {showSuccess} = useCustomSnackbar();
  const {adminId} = runningDinner;

  const mealItems = meals.map((meal) =>
      <MealItem {...meal} key={meal.id} />
  );

  const [editMealsDialogOpen, setEditMealsDialogOpen] = React.useState(false);

  const {t} = useTranslation(['admin', 'common']);

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  function updateMeals(mealsToUpdate: Meal[]) {
      updateMealTimesAsync(adminId, mealsToUpdate)
        .then(updatedRunningDinner => onRunningDinnerUpdate(updatedRunningDinner))
        .then(handleUpdateSuccess)
        .catch((errorResponse) => showHttpErrorDefaultNotification(errorResponse));
  }

  function handleUpdateSuccess() {
    setEditMealsDialogOpen(false);
    showSuccess(t('admin:mealtimes_save_success'));
  }

  return (
    <Card>
      <CardContent>
        <Subtitle i18n='admin:time_schedule' />
        <div>
          {<List dense={true}>{mealItems}</List>}
        </div>
      </CardContent>
      <CardActions>
        <Grid container justifyContent={"flex-end"}>
          <Grid item>
            <Box pr={2} mt={-2} pb={2}>
              <PrimarySuccessButtonAsync onClick={() => setEditMealsDialogOpen(true)} size={"small"} data-testid="open-edit-meals-action">
                {t('common:label_edit')}
              </PrimarySuccessButtonAsync>
            </Box>
          </Grid>
        </Grid>
      </CardActions>

      <EditMealsDialog open={editMealsDialogOpen}
                       dashboardAdminActivities={dashboardAdminActivities}
                       runningDinnerDate={runningDinner.basicDetails.date}
                       onSave={(mealsToUpdate) => updateMeals(mealsToUpdate)}
                       incomingMeals={meals}
                       onCancel={() => setEditMealsDialogOpen(false)} />

    </Card>
  );

}
