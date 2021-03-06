import React from 'react';
import { Dialog, DialogContent, Grid } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MealTimeEditControl from "./MealTimeEditControl";
import cloneDeep from "lodash/cloneDeep";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import { withTranslation } from 'react-i18next';
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";

class EditMealsDialog extends React.Component {

  constructor(props) {
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

  handleTimeChange(meal, newTime) {
    const meals = cloneDeep(this.state.meals);
    for (var i = 0; i < meals.length; i++) {
      if (meals[i].id === meal.id) {
        meals[i].time = newTime;
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

    const { open } = this.props;

    const meals = this.state.meals;

    const {t} = this.props;

    const mealTimeFields = meals.map((meal) =>
        <Grid item xs key={meal.id}>
          <MealTimeEditControl {...meal} onHandleTimeChange={(newValue) => this.handleTimeChange(meal, newValue)}></MealTimeEditControl>
        </Grid>
    );

    return (
        <Dialog open={open} onClose={this.triggerCancel} aria-labelledby="form-dialog-title">
          <DialogTitleCloseable id="edit-meals-dialog-title" onClose={this.triggerCancel}>{t('time_schedule_edit')}</DialogTitleCloseable>
          <DialogContent>
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
