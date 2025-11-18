import React, { useEffect, useState } from 'react';
import { Grid, DialogContent, Dialog } from '@mui/material';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import { findEntityById } from '@runningdinner/shared';
import { filter, cloneDeep } from 'lodash-es';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { useTranslation } from 'react-i18next';
import SelectableEntity from '../common/SelectableEntity';
import Box from '@mui/material/Box';

export const SingleSelectionDialog = ({ selectableEntities, customSelectedEntities, open, onClose }) => {
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

function SingleSelectionDialogView({ selectableEntities, onSelectionChange, open, onOk, onCancel }) {
  const { t } = useTranslation(['common']);

  const selectableEntityControls = selectableEntities.map((entity) => (
    <Box key={entity.id}>
      <SelectableEntity entity={entity} onSelectionChange={onSelectionChange} />
    </Box>
  ));

  const numEntities = selectableEntityControls.length;
  const halfNumEntities = numEntities / 2;
  const remainder = numEntities % 2;
  const entitiesLeftCol = selectableEntityControls.slice(0, halfNumEntities + remainder);
  const entitiesRightCol = selectableEntityControls.slice(halfNumEntities + remainder);

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="form-dialog-title" maxWidth={'md'} fullWidth={true}>
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
      <DialogActionsPanel onOk={onOk} onCancel={onCancel} okLabel="Ok" cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
