import React from 'react'
import MealItem from "./MealItem";
import {Card, CardActions, CardContent, Grid, List} from "@material-ui/core";
import EditMealsDialog from "./EditMealsDialog";
import {useTranslation} from "react-i18next";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {Subtitle} from "../../common/theme/typography/Tags";
import {
  CallbackHandler,
  findAdminActivitiesAction,
  Meal,
  updateMealTimesAsync, useBackendIssueHandler,
  useDashboardDispatch,
  useDashboardState
} from "@runningdinner/shared";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";

export interface MealsListProps {
  meals: Meal[];
  adminId: string;
  onRunningDinnerUpdate: CallbackHandler;
}

export default function MealsList({meals, adminId, onRunningDinnerUpdate}: MealsListProps) {

  const {showSuccess} = useCustomSnackbar();
  const {loading, dashboardAdminActivities} = useDashboardState();
  const dispatch = useDashboardDispatch();

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
        .then(() => findAdminActivitiesAction(adminId, dispatch))
        .catch((errorResponse) => showHttpErrorDefaultNotification(errorResponse));
  }

  function handleUpdateSuccess() {
    setEditMealsDialogOpen(false);
    showSuccess('Zeitplan erfolgreich gespeichert!');
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
          <Grid container justify={"flex-end"}>
            <Grid item>
              <PrimarySuccessButtonAsync onClick={() => setEditMealsDialogOpen(true)} size={"small"}>{t('common:label_edit')}</PrimarySuccessButtonAsync>
            </Grid>
          </Grid>
        </CardActions>

        { !loading && <EditMealsDialog open={editMealsDialogOpen}
                                       dashboardAdminActivities={dashboardAdminActivities}
                                       onSave={(mealsToUpdate) => updateMeals(mealsToUpdate)}
                                       meals={meals}
                                       onCancel={() => setEditMealsDialogOpen(false)}>
                     </EditMealsDialog> }

      </Card>
  );

}
