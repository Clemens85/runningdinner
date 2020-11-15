import React, {useEffect, useState} from 'react';
import { Grid, DialogContent, Dialog, Checkbox, FormControlLabel } from '@material-ui/core';
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import {findEntityById} from "../../shared/Utils";
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import Fullname from "../../shared/Fullname";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import {useTranslation} from "react-i18next";

export const SingleSelectionDialog = ({selectableEntities, customSelectedEntities, open, onClose}) => {

  const prepareSelectedEntitiesForView = (incomingSelectableEntities, incomingCustomSelectedEntities) => {
    const result = cloneDeep(incomingSelectableEntities);
    for (let i = 0; i < incomingCustomSelectedEntities.length; i++) {
      const selectableEntity = findEntityById(result, incomingCustomSelectedEntities[i].id);
      selectableEntity.selected = true;
    }
    return result;
  };

  const handleSelectionChange = (participant, selected) => {
    const result = cloneDeep(editableSelectableEntities);
    const participantToChange = findEntityById(result, participant.id);
    participantToChange.selected = selected;
    setEditableSelectableEntities(result);
  };

  const handleOk = () => {
    const result = filter(editableSelectableEntities, ['selected', true]);
    onClose(result);
  };
  const handleCancel = () => {
    onClose(customSelectedEntities);
  };

  const [editableSelectableEntities, setEditableSelectableEntities] = useState(prepareSelectedEntitiesForView(selectableEntities, customSelectedEntities));

  useEffect(() => {
    setEditableSelectableEntities(prepareSelectedEntitiesForView(selectableEntities, customSelectedEntities));
  }, [selectableEntities, customSelectedEntities, open]);

  return (
    <SingleSelectionDialogView open={open} onOk={handleOk} onCancel={handleCancel} selectableEntities={editableSelectableEntities} onSelectionChange={handleSelectionChange} />
  );
};

function SingleSelectionDialogView ({selectableEntities, onSelectionChange, open, onOk, onCancel}) {

  const {t} = useTranslation(['common']);

  const selectableEntityControls = selectableEntities.map(entity =>
    <SelectableEntity entity={entity} onSelectionChange={onSelectionChange} key={entity.id} />
  );

  const numEntities = selectableEntityControls.length;
  const halfNumEntities = numEntities / 2;
  const remainder = numEntities % 2;
  const entitiesLeftCol = selectableEntityControls.slice(0, halfNumEntities + remainder);
  const entitiesRightCol = selectableEntityControls.slice(halfNumEntities + remainder);

  return (
      <Dialog open={open} onClose={onCancel} aria-labelledby="form-dialog-title">
        <DialogTitleCloseable id="edit-meals-dialog-title" onClose={onCancel}>
          {t('common:single_selection')}
        </DialogTitleCloseable>
        <DialogContent>
          <Grid container>
            <Grid item xs={12} md={6}>
              {entitiesLeftCol}
            </Grid>
            <Grid item xs={12} md={6}>
              {entitiesRightCol}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActionsPanel onOk={onOk} onCancel={onCancel} okLabel="Ok" cancelLabel={t('common:cancel')}  />
      </Dialog>
  );
};

function SelectableEntity({entity, onSelectionChange}) {

  const fullName = <Fullname {...entity} />;

  const handleChange = changeEvt => {
    const selected = changeEvt.target.checked;
    onSelectionChange(entity, selected);
  };

  const selected = !!entity.selected;

  return (
      <FormControlLabel label={fullName} control={
        <Checkbox color="primary" onChange={handleChange} checked={selected} />
      } />
  );
}
