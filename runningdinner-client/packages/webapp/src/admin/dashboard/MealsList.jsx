import React from 'react'
import Meal from "./Meal";
import { Card, CardContent, CardActions, List, Grid } from "@material-ui/core";
import EditMealsDialog from "./EditMealsDialog";
import {useTranslation} from "react-i18next";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {Subtitle} from "../../common/theme/typography/Tags";
import {useSnackbar} from "notistack";
import {updateMealTimesAsync} from "@runningdinner/shared";

export default function MealsList({meals, adminId, onRuningDinnerUpdate}) {

  const {enqueueSnackbar} = useSnackbar();

  const mealItems = meals.map((meal) =>
      <Meal meal={meal} key={meal.id} />
  );

  const [editMealsDialogOpen, setEditMealsDialogOpen] = React.useState(false);

  const {t} = useTranslation(['admin', 'common']);

  function updateMeals(mealsToUpdate) {
      updateMealTimesAsync(adminId, mealsToUpdate)
        .then(updatedRunningDinner => onRuningDinnerUpdate(updatedRunningDinner))
        .then(handleUpdateSuccess)
        .catch((errorResponse) => handleUpdateError(errorResponse));
  }

  function handleUpdateSuccess() {
    setEditMealsDialogOpen(false);
    enqueueSnackbar('Zeitplan erfolgreich gespeichert!', {variant: "success"});
  }
  function handleUpdateError(errorResponse) {
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

        <EditMealsDialog open={editMealsDialogOpen}
                         onSave={(mealsToUpdate) => updateMeals(mealsToUpdate)}
                         meals={meals}
                         onCancel={() => setEditMealsDialogOpen(false)}>
        </EditMealsDialog>

      </Card>
  );

}
