import { Dialog, DialogContent, Box } from '@mui/material';
import { Alert } from '@mui/material';
import { CallbackHandler, SettingsChangeType, RunningDinnerBasicDetailsFormModel } from '@runningdinner/shared';
import { useTranslation, Trans } from 'react-i18next';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import { Subtitle } from '../../common/theme/typography/Tags';

export interface BasicSettingsChangeDialogData {
  settingsChangeTypeList: SettingsChangeType[];
  basicDetailsToSubmit: RunningDinnerBasicDetailsFormModel;
}

export interface BasicSettingsChangeDialogProps {
  onCancel: CallbackHandler;
  onSave: CallbackHandler;
  basicSettingsChangeDialogData: BasicSettingsChangeDialogData;
}

export function BasicSettingsChangeDialog({ onCancel, onSave, basicSettingsChangeDialogData }: BasicSettingsChangeDialogProps) {
  const { settingsChangeTypeList, basicDetailsToSubmit } = basicSettingsChangeDialogData;
  const { t } = useTranslation(['admin', 'common']);

  return (
    <Dialog onClose={onCancel} open={true}>
      <DialogTitleCloseable onClose={onCancel}>{t('common:preview')}</DialogTitleCloseable>
      <DialogContent>
        <Subtitle i18n={'landing:registration_finish_check'} />
        {settingsChangeTypeList.map((settingsChangeType) => (
          <Box my={2} key={settingsChangeType}>
            {settingsChangeType === SettingsChangeType.CHANGE_IN_DATE_WITH_REGISTERED_PARTICIPANTS && (
              <Alert severity="info" variant="outlined">
                <Trans i18nKey="settings_update_date_change" ns="admin" />
              </Alert>
            )}
            {settingsChangeType === SettingsChangeType.CHANGE_FROM_CLOSED_TO_NON_CLOSED && (
              <Alert severity="info" variant="outlined">
                <Trans i18nKey={`settings_update_closed_to_${basicDetailsToSubmit.registrationType.toLowerCase()}_change`} ns="admin" />
              </Alert>
            )}
            {settingsChangeType === SettingsChangeType.CHANGE_FROM_NON_CLOSED_TO_CLOSED && (
              <Alert severity="info" variant="outlined">
                <Trans i18nKey="settings_update_nonclosed_to_closed_change" ns="admin" />
              </Alert>
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActionsPanel onOk={onSave} onCancel={onCancel} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
