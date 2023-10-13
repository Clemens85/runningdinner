import {useState} from 'react';
import {Box, Dialog, DialogContent, Grid} from '@mui/material';
import MealTimeEditControl from "./MealTimeEditControl";
import cloneDeep from "lodash/cloneDeep";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import {useTranslation} from 'react-i18next';
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import {
  CallbackHandler,
  DashboardAdminActivities,
  isMessageActivityContained,
  isSameEntity, isValidDate,
  Meal, setHoursAndMinutesFromSrcToDest
} from "@runningdinner/shared";
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';


export interface EditMealsDialogProps {
  runningDinnerDate: Date;
  onCancel: CallbackHandler;
  onSave: CallbackHandler;
  open: boolean;
  dashboardAdminActivities: DashboardAdminActivities;
  incomingMeals: Meal[];
}

export function EditMealsDialog({ open, dashboardAdminActivities, incomingMeals, runningDinnerDate, onCancel, onSave }: EditMealsDialogProps) {

  const {t} = useTranslation(['common', 'admin']);

  const [meals, setMeals] = useState(cloneDeep(incomingMeals));

  function handleTimeChange(meal: Meal, newTime: Date) {
    const updatedMeals = cloneDeep(meals);
    for (let i = 0; i < updatedMeals.length; i++) {
      if (isSameEntity(updatedMeals[i], meal)) {
        updatedMeals[i].time = isValidDate(newTime) ? setHoursAndMinutesFromSrcToDest(newTime, runningDinnerDate) : newTime;
      }
    }
    setMeals(updatedMeals);
  }

  function triggerSave() {
    onSave(meals);
  }

  function triggerCancel() {
    resetState();
    onCancel();
  }

  function resetState() {
    setMeals(cloneDeep(incomingMeals));
  }

  const mealTimeFields = meals.map((meal: Meal) =>
    <Grid item xs key={meal.id}>
      <MealTimeEditControl {...meal} onHandleTimeChange={(newValue) => handleTimeChange(meal, newValue)} />
    </Grid>
  );

  const showMessagesAlreadySentInfo = isMessageActivityContained(dashboardAdminActivities.activities);

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="form-dialog-title" data-testid="edit-meals-dialog">
      <DialogTitleCloseable id="edit-meals-dialog-title" onClose={onCancel}>{t('admin:time_schedule_edit')}</DialogTitleCloseable>
      <DialogContent>
        <Box pt={2}>
          { showMessagesAlreadySentInfo &&
            <Alert severity={"info"} data-testid="edit-meal-times-warning-messages-sent" sx={{ mb: 5 }}>
              <AlertTitle>{t('attention')}</AlertTitle>
              {t('admin:attention_mealtimes_messages_already_sent')}
            </Alert> }
          <Grid container spacing={2}>
            {mealTimeFields}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={triggerSave} onCancel={triggerCancel} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
    </Dialog>
  );

}