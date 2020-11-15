import {useTranslation} from "react-i18next";
import ParticipantService from "shared/admin/ParticipantService";
import {
  Dialog,
  DialogContent,
  Box,
} from "@material-ui/core";
import {DialogTitleCloseable} from "common/theme/DialogTitleCloseable";
import React, {useState} from "react";
import TeamService from "shared/admin/TeamService";
import DialogActionsPanel from "common/theme/DialogActionsPanel";
import {Span} from "common/theme/typography/Tags";
import {useSnackbar} from "notistack";
import {Alert, AlertTitle} from "@material-ui/lab";

export const TeamCancelDialog = ({adminId, teamToCancel, isOpen, onClose}) => {

  const {t} = useTranslation(['admin', 'common']);

  const [showTeamCancelPreview, setShowTeamCancelPreview] = useState(false);

  const {enqueueSnackbar} = useSnackbar();

  const cancelTeamAsync = async() => {
      const updatedTeam = await TeamService.cancelTeamAsync(adminId, teamToCancel, [], true);
      enqueueSnackbar(t("admin:team_cancel_member_success_text"),  {variant: "success"});
      onClose(updatedTeam);
  };

  const handleShowPreview = () => {
    setShowTeamCancelPreview(true);
  };

  if (!isOpen) {
    return null;
  }
  return (
      <>
        { showTeamCancelPreview ?
              <TeamCancelPreview team={teamToCancel} onCancelDialog={onClose} /> :
              <TeamCancelOverview team={teamToCancel} onCancelDialog={onClose} onShowPreview={handleShowPreview} />
        }
      </>
  );
};

function TeamCancelOverview({team, onCancelDialog, onShowPreview}) {

  const {t} = useTranslation(['admin', 'common']);
  const teamDisplay = t('team', {teamNumber: team.teamNumber});
  const okLabel = t('common:next') + ' ...';
  return (
      <Dialog open={true} onClose={onCancelDialog} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={onCancelDialog}>{t('team_member_cancel', {teamMemberToCancel: teamDisplay})}</DialogTitleCloseable>
        <DialogContent>
          <Box>
            <Span i18n="admin:team_cancel_info_text" />
          </Box>
          <Box mt={3}>
            { true && <Alert severity="info" variant="outlined">
                        <AlertTitle>{t('admin:team_cancel_info_headline_too_few_participants')}</AlertTitle>
                        <Span i18n='admin:team_cancel_info_text_too_few_participants' parameters={{ numNeededParticipants: 2}} html={true} />
                      </Alert>
            }
          </Box>
        </DialogContent>
        <DialogActionsPanel onOk={onShowPreview} onCancel={onCancelDialog} okLabel={okLabel} cancelLabel={t('common:cancel')} danger={false}/>
      </Dialog>
  );
}


function TeamCancelPreview({team, onCancelDialog}) {

  const {t} = useTranslation(['admin', 'common']);
  const {teamNumber} = team;

  return (
      <Dialog open={true} onClose={onCancelDialog} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={onCancelDialog}>{t('team_cancel_complete_headline', {teamNumber: teamNumber})}</DialogTitleCloseable>
        <DialogContent>
          <Box>
            TODO
          </Box>
        </DialogContent>
        <DialogActionsPanel onOk={onCancelDialog} onCancel={onCancelDialog} okLabel={t('team_cancel_button')} cancelLabel={t('common:cancel')} danger={true}/>
      </Dialog>
  )
}
