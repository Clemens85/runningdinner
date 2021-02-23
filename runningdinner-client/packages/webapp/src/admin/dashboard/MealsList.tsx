import React from 'react'
import MealItem from "./MealItem";
import {Card, CardActions, CardContent, Grid, List} from "@material-ui/core";
import EditMealsDialog from "./EditMealsDialog";
import {useTranslation} from "react-i18next";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {Subtitle} from "../../common/theme/typography/Tags";
import {useSnackbar} from "notistack";
import {
  CallbackHandler,
  findAdminActivitiesAction,
  Meal,
  updateMealTimesAsync,
  useDashboardDispatch,
  useDashboardState
} from "@runningdinner/shared";

export interface MealsListProps {
  meals: Meal[];
  adminId: string;
  onRunningDinnerUpdate: CallbackHandler;
}

export default function MealsList({meals, adminId, onRunningDinnerUpdate}: MealsListProps) {

  const {enqueueSnackbar} = useSnackbar();
  const {loading, dashboardAdminActivities} = useDashboardState();
  const dispatch = useDashboardDispatch();

  const mealItems = meals.map((meal) =>
      <MealItem {...meal} key={meal.id} />
  );

  const [editMealsDialogOpen, setEditMealsDialogOpen] = React.useState(false);

  const {t} = useTranslation(['admin', 'common']);

  function updateMeals(mealsToUpdate: Meal[]) {
      updateMealTimesAsync(adminId, mealsToUpdate)
        .then(updatedRunningDinner => onRunningDinnerUpdate(updatedRunningDinner))
        .then(handleUpdateSuccess)
        .then(() => findAdminActivitiesAction(adminId, dispatch))
        .catch((errorResponse) => handleUpdateError(errorResponse));
  }

  function handleUpdateSuccess() {
    setEditMealsDialogOpen(false);
    enqueueSnackbar('Zeitplan erfolgreich gespeichert!', {variant: "success"});
  }
  function handleUpdateError(errorResponse: Error) {
    const errorReason = errorResponse.message ? errorResponse.message : 'Unknown';
    enqueueSnackbar(`Fehler beim Speichern: ${errorReason}`, {variant: "error"});
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
