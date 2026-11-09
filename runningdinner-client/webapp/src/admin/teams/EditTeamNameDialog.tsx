import { Alert, AlertTitle, Box, Dialog, DialogContent } from '@mui/material';
import { getFullnameList, Team, TeamLabel, updateTeamNameAsync } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { TeamNameForm, useTeamNameForm } from '../../common/team/TeamNameForm';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import Paragraph from '../../common/theme/typography/Paragraph';
import { Subtitle } from '../../common/theme/typography/Tags';

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
        <Subtitle>
          <TeamLabel team={team} />
        </Subtitle>
        <Paragraph>{getFullnameList(team.teamMembers)}</Paragraph>
        <Box sx={{ mt: 2 }}>
          <Paragraph i18n="admin:team_name_dialog_intro" />
        </Box>
        <Box sx={{ mt: 2 }}>
          <TeamNameForm formMethods={formMethods} onSubmit={submit} />
        </Box>
        <Alert severity="info" variant="outlined" sx={{ mt: 3 }}>
          <AlertTitle>{t('admin:team_name_dialog_info_headline')}</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>{t('admin:team_name_dialog_info_visibility')}</li>
            <li>{t('admin:team_name_dialog_info_participants')}</li>
            <li>{t('admin:team_name_dialog_info_remove')}</li>
            <li>{t('admin:team_name_dialog_info_recreate')}</li>
          </Box>
        </Alert>
      </DialogContent>
      <DialogActionsPanel onOk={submit} onCancel={onClose} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
