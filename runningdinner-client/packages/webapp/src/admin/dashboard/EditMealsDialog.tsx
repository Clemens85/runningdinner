import React from 'react';
import {Box, Dialog, DialogContent, Grid} from '@mui/material';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MealTimeEditControl from "./MealTimeEditControl";
import cloneDeep from "lodash/cloneDeep";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import { withTranslation, WithTranslation } from 'react-i18next';
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


type EditMealsDialogState = {
  meals: Meal[]
}

export interface EditMealsDialogProps extends WithTranslation {
  meals: Meal[];
  runningDinnerDate: Date;
  onCancel: CallbackHandler;
  onSave: CallbackHandler;
  open: boolean;
  dashboardAdminActivities: DashboardAdminActivities;
}

class EditMealsDialog extends React.Component<EditMealsDialogProps, EditMealsDialogState> {

  constructor(props: EditMealsDialogProps) {
    super(props);
    this.state = {
      meals: cloneDeep(this.props.meals)
    };
    // This binding is necessary to make `this` work in the callback
    this.triggerCancel = this.triggerCancel.bind(this);
    this.triggerSave = this.triggerSave.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this._resetState = this._resetState.bind(this);
  }

  handleTimeChange(meal: Meal, newTime: Date) {
    const meals = cloneDeep(this.state.meals);
    for (let i = 0; i < meals.length; i++) {
      if (isSameEntity(meals[i], meal)) {
        meals[i].time = isValidDate(newTime) ? setHoursAndMinutesFromSrcToDest(newTime, this.props.runningDinnerDate) : newTime;
          // newTime;
      }
    }
    this.setState({
      meals: meals
    });
  }

  triggerSave() {
    const {meals} = this.state;
    this.props.onSave(meals);
  }

  triggerCancel() {
    this.props.onCancel();
    this._resetState();
  }

  _resetState() {
    this.setState({
      meals: cloneDeep(this.props.meals)
    });
  }


  render() {

    const { open, dashboardAdminActivities } = this.props;

    const meals = this.state.meals;
    const {t} = this.props;

    const showMessagesAlreadySentInfo = isMessageActivityContained(dashboardAdminActivities.activities);

    const mealTimeFields = meals.map((meal) =>
        <Grid item xs key={meal.id}>
          <MealTimeEditControl {...meal} onHandleTimeChange={(newValue) => this.handleTimeChange(meal, newValue)} />
        </Grid>
    );

    return (
        <Dialog open={open} onClose={this.triggerCancel} aria-labelledby="form-dialog-title" data-testid="edit-meals-dialog">
          <DialogTitleCloseable id="edit-meals-dialog-title" onClose={this.triggerCancel}>{t('time_schedule_edit')}</DialogTitleCloseable>
          <DialogContent>
            { showMessagesAlreadySentInfo &&
              <Box my={2}>
                <Alert severity={"info"} data-testid="edit-meal-times-warning-messages-sent">
                  <AlertTitle>{t('attention')}</AlertTitle>
                  {t('admin:attention_mealtimes_messages_already_sent')}
                </Alert>
              </Box> }
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid container spacing={2}>
                {mealTimeFields}
              </Grid>
            </MuiPickersUtilsProvider>
          </DialogContent>
          <DialogActionsPanel onOk={this.triggerSave} onCancel={this.triggerCancel} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
        </Dialog>
    );
  }

}

export default withTranslation(['admin', 'common'])(EditMealsDialog);
