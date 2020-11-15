import React from 'react'
import Meal from "./Meal";
import { Card, CardContent, CardActions, List, Grid } from "@material-ui/core";
import EditMealsDialog from "./EditMealsDialog";
import RunningDinnerService from "../../shared/admin/RunningDinnerService";
import ErrorToast from "../../common/ErrorToast";
import SuccessToast from "../../common/SuccessToast";
import {useTranslation} from "react-i18next";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {Subtitle} from "../../common/theme/typography/Tags";

export default function MealsList({meals, adminId, onRuningDinnerUpdate}) {

  const mealItems = meals.map((meal) =>
      <Meal meal={meal} key={meal.id}></Meal>
  );

  const RESPONSE_CLOSED_TOAST_STATE = {
    error: false,
    success: false,
    message: ''
  };

  const [editMealsDialogOpen, setEditMealsDialogOpen] = React.useState(false);
  const [responseToast, setResponseToast] = React.useState(RESPONSE_CLOSED_TOAST_STATE);

  const {t} = useTranslation(['admin', 'common']);

  function updateMeals(mealsToUpdate) {
    RunningDinnerService
        .updateMealTimesAsync(adminId, mealsToUpdate)
        .then(updatedRunningDinner => onRuningDinnerUpdate(updatedRunningDinner))
        .then(handleUpdateSuccess)
        .catch((errorResponse) => handleUpdateError(errorResponse));
  }

  function handleUpdateSuccess() {
    setEditMealsDialogOpen(false);
    setResponseToast({
      error: false,
      success: true,
      message: 'Zeitplan erfolgreich gespeichert!'
    })
  }
  function handleUpdateError(errorResponse) {
    const errorReason = errorResponse.message ? errorResponse.message : 'Unknown';
    setResponseToast({
      error: true,
      success: false,
      message: `Fehler beim Speichern: ${errorReason}`
    })
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

        <EditMealsDialog open={editMealsDialogOpen}
                         onSave={(mealsToUpdate) => updateMeals(mealsToUpdate)}
                         meals={meals}
                         onCancel={() => setEditMealsDialogOpen(false)}>
        </EditMealsDialog>

        <ErrorToast show={responseToast.error} message={responseToast.message}/>
        <SuccessToast show={responseToast.success} message={responseToast.message} />

      </Card>
  );

}
