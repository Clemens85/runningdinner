import { Box, Dialog, DialogContent } from '@mui/material';
import { Team, updateTeamNameAsync } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { TeamNameForm, useTeamNameForm } from '../../common/team/TeamNameForm';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import Paragraph from '../../common/theme/typography/Paragraph';

export interface EditTeamNameDialogProps {
  adminId: string;
  team: Team;
  onClose: () => unknown;
  onTeamNameChanged: (updatedTeam: Team) => unknown;
}

export function EditTeamNameDialog({ adminId, team, onClose, onTeamNameChanged }: EditTeamNameDialogProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess } = useCustomSnackbar();

  const { formMethods, submit } = useTeamNameForm({
    initialTeamName: team.teamName,
    saveTeamName: async (teamName) => {
      const updatedTeam = await updateTeamNameAsync(adminId, team.id!, teamName);
      onClose();
      onTeamNameChanged(updatedTeam);
      showSuccess(t('admin:team_name_saved'));
    },
  });

  return (
    <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="sm" aria-labelledby="edit-team-name-title">
      <DialogTitleCloseable onClose={onClose}>{t('admin:team_name')}</DialogTitleCloseable>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TeamNameForm formMethods={formMethods} onSubmit={submit} />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Paragraph i18n="admin:team_name_visible_hint" />
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={submit} onCancel={onClose} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
