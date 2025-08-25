import { ChangeEvent, useState, KeyboardEvent } from 'react';
import { Box, Button, Dialog, DialogContent, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import MealTimeEditControl from './MealTimeEditControl';
import { cloneDeep } from 'lodash-es';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import { useTranslation } from 'react-i18next';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import {
  BaseAdminIdProps,
  CallbackHandler,
  DashboardAdminActivities,
  findEntityById,
  HttpError,
  isMessageActivityContained,
  isSameEntity,
  isValidDate,
  Meal,
  newUuid,
  removeIdsFromEntitiesIfNotContainedInExistingEntities,
  RunningDinner,
  setHoursAndMinutesFromSrcToDest,
  updateMealsAsync,
  useBackendIssueHandler,
  withHourAndMinute,
} from '@runningdinner/shared';
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import { shouldShowDropTeamsConfirmationOnMealsUpdate } from './MealUpdateUtil';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';

export interface EditMealsDialogProps extends BaseAdminIdProps {
  runningDinnerDate: Date;
  onCancel: CallbackHandler;
  onMealsUpdated: (updatedRunningDinner: RunningDinner) => unknown;
  open: boolean;
  dashboardAdminActivities: DashboardAdminActivities;
  incomingMeals: Meal[];
}

export function EditMealsDialog({ adminId, open, dashboardAdminActivities, incomingMeals, runningDinnerDate, onCancel, onMealsUpdated }: EditMealsDialogProps) {
  const { t } = useTranslation(['common', 'admin']);

  const { getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const [meals, setMeals] = useState(cloneDeep(incomingMeals));
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  const [showDropTeamsConfirmDialog, setShowDropTeamsConfirmDialog] = useState(false);
  const [pendingMealsToSave, setPendingMealsToSave] = useState<Meal[] | null>(null);

  const isMobileDevie = useIsMobileDevice('xs');

  function handleTimeChange(meal: Meal, newTime: Date) {
    const updatedMeals = cloneDeep(meals);
    for (let i = 0; i < updatedMeals.length; i++) {
      if (isSameEntity(updatedMeals[i], meal)) {
        updatedMeals[i].time = isValidDate(newTime) ? setHoursAndMinutesFromSrcToDest(newTime, runningDinnerDate) : newTime;
      }
    }
    setMeals(updatedMeals);
  }

  function handleMealLabelChange(meal: Meal, newLabel: string) {
    const updatedMeals = cloneDeep(meals);
    const mealToUpdate = findEntityById(updatedMeals, meal.id);
    mealToUpdate.label = newLabel;
    setMeals(updatedMeals);
  }

  function handleRemoveMeal(meal: Meal) {
    const updatedMeals = cloneDeep(meals).filter((m) => !isSameEntity(m, meal));
    setMeals(updatedMeals);
    if (editingMealId === meal.id) {
      setEditingMealId(null);
    }
  }

  function handleAddMeal(meal: Meal) {
    const updatedMeals = cloneDeep(meals);
    updatedMeals.push(meal);
    setMeals(updatedMeals);
    setEditingMealId(meal.id || null);
  }

  async function handleSave() {
    const mealsToSave = removeIdsFromEntitiesIfNotContainedInExistingEntities(meals, incomingMeals);
    const needsConfirmation = await shouldShowDropTeamsConfirmationOnMealsUpdate(adminId, mealsToSave, incomingMeals);
    if (needsConfirmation) {
      setPendingMealsToSave(mealsToSave);
      setShowDropTeamsConfirmDialog(true);
      return;
    }
    await doSaveMeals(mealsToSave);
  }

  function handleConfirmSave() {
    if (pendingMealsToSave) {
      doSaveMeals(pendingMealsToSave);
      setShowDropTeamsConfirmDialog(false);
      setPendingMealsToSave(null);
    }
  }

  function handleCancelConfirm() {
    setShowDropTeamsConfirmDialog(false);
    setPendingMealsToSave(null);
  }

  async function doSaveMeals(mealsToSave: Meal[]) {
    let updatedRunningdinner: RunningDinner;
    try {
      updatedRunningdinner = await updateMealsAsync(adminId, mealsToSave);
    } catch (errorResponse) {
      showHttpErrorDefaultNotification(errorResponse as HttpError);
      resetState();
      return;
    }
    onMealsUpdated(updatedRunningdinner);
  }

  function triggerCancel() {
    resetState();
    onCancel();
  }

  function resetState() {
    setMeals(cloneDeep(incomingMeals));
  }

  const mealTimeFields = meals.map((meal: Meal) => (
    <Grid item xs={isMobileDevie ? 12 : undefined} key={meal.id}>
      <Box sx={{ px: 2 }}>
        <EditableMealControl
          meal={meal}
          handleTimeChange={handleTimeChange}
          handleMealLabelChange={handleMealLabelChange}
          isEditing={editingMealId === meal.id}
          setIsEditing={(editing: boolean) => setEditingMealId(editing ? meal.id || null : null)}
          handleRemoveMeal={handleRemoveMeal}
        />
      </Box>
    </Grid>
  ));

  const showMessagesAlreadySentInfo = isMessageActivityContained(dashboardAdminActivities.activities);

  return (
    <>
      <Dialog open={open} onClose={triggerCancel} aria-labelledby="form-dialog-title" data-testid="edit-meals-dialog" maxWidth="lg">
        <DialogTitleCloseable id="edit-meals-dialog-title" onClose={triggerCancel}>
          {t('admin:time_schedule_edit')}
        </DialogTitleCloseable>
        <DialogContent>
          <Box pt={2}>
            {showMessagesAlreadySentInfo && (
              <Alert severity={'info'} data-testid="edit-meal-times-warning-messages-sent" sx={{ mb: 5 }}>
                <AlertTitle>{t('attention')}</AlertTitle>
                {t('admin:attention_mealtimes_messages_already_sent')}
              </Alert>
            )}
            <Grid container spacing={2}>
              {mealTimeFields}
            </Grid>
            <AddMealControl handleAddMeal={handleAddMeal} meals={meals} />
          </Box>
        </DialogContent>
        <DialogActionsPanel onOk={handleSave} onCancel={triggerCancel} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
      </Dialog>
      {showDropTeamsConfirmDialog && (
        <ConfirmationDialog
          open={true}
          onClose={(confirmed) => {
            if (confirmed) {
              handleConfirmSave();
            } else {
              handleCancelConfirm();
            }
          }}
          danger={true}
          dialogTitle={t('admin:attention')}
          dialogContent={<Alert severity={'info'}>{t('admin:meals_update_cause_drop_teams')}</Alert>}
          buttonCancelText={t('common:cancel')}
          buttonConfirmText={t('common:save')}
        />
      )}
    </>
  );
}

type EditableMealControlProps = {
  meal: Meal;
  handleTimeChange: (meal: Meal, newTime: Date) => unknown;
  handleMealLabelChange: (meal: Meal, newLabel: string) => unknown;
  handleRemoveMeal: (meal: Meal) => unknown;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
};

function EditableMealControl({ meal, handleTimeChange, handleMealLabelChange, handleRemoveMeal, isEditing, setIsEditing }: EditableMealControlProps) {
  const [draft, setDraft] = useState(meal.label);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveDraft();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancelEditing();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  };

  function saveDraft() {
    handleMealLabelChange(meal, draft);
    setIsEditing(false);
  }

  function handleCancelEditing() {
    setIsEditing(false);
    setDraft(meal.label);
  }

  return (
    <>
      <Stack direction="row" alignItems={'center'} justifyContent={'space-between'} sx={{ mb: 1 }}>
        <Stack direction="row" alignItems={'center'}>
          {!isEditing && <Typography>{meal.label}</Typography>}
          {isEditing && <TextField value={draft} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={saveDraft} size="small" autoFocus fullWidth />}
          {!isEditing && (
            <IconButton sx={{ pr: 0, pl: 1, mr: 0 }} onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
          {isEditing && (
            <IconButton sx={{ pr: 0, pl: 1, mr: 0 }} onClick={handleCancelEditing}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
        {!isEditing && (
          <IconButton sx={{ pr: 0, pl: 0, mr: 0 }} onClick={() => handleRemoveMeal(meal)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Stack>
      <MealTimeEditControl time={meal.time} label={''} onHandleTimeChange={(newValue) => handleTimeChange(meal, newValue)} sx={{ width: '100%' }} />
    </>
  );
}

type AddMealControlProps = {
  handleAddMeal: (meal: Meal) => unknown;
  meals: Meal[];
};

function AddMealControl({ handleAddMeal, meals }: AddMealControlProps) {
  const { t } = useTranslation(['common']);

  if (!meals || meals.length >= 3) {
    return null;
  }

  function onAddMeal() {
    const lastMeal = meals[meals.length - 1];
    const newMeal = {
      id: newUuid(),
      label: t('common:untitled'),
      time: withHourAndMinute(lastMeal.time, 23, 59),
    };
    handleAddMeal(newMeal);
  }

  return (
    <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
      <Grid item>
        <Button color={'primary'} startIcon={<AddIcon />} onClick={onAddMeal} style={{ paddingLeft: '0' }}>
          {t('common:add')}
        </Button>
      </Grid>
    </Grid>
  );
}
