import {useTranslation} from "react-i18next";
import {
  Dialog,
  DialogContent,
  Box,
} from "@mui/material";
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import React from "react";
import {
  cancelTeamMemberAsync,
  CONSTANTS, findIssueByMessage,
  getFullname,
  getTeamMemberCancelInfo,
  isSameEntity,
  Participant,
  Team,
  useBackendIssueHandler
} from "@runningdinner/shared";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {Span} from "../../../common/theme/typography/Tags";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";

export interface TeamMemberCancelDialogProps {
  adminId: string;
  team: Team;
  teamMemberToCancel: Participant;
  isOpen: boolean;
  onClose: (result?: TeamMemberCancelDialogResult) => unknown;
}

export interface TeamMemberCancelDialogResult {
  teamAfterCancel?: Team;
  mustCancelWholeTeam?: boolean;
}

export const TeamMemberCancelDialog = ({adminId, team, teamMemberToCancel, isOpen, onClose}: TeamMemberCancelDialogProps) => {

  const {t} = useTranslation(['admin', 'common']);

  const {getIssuesUntranslated, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const teamMemberToCancelIsHost = isSameEntity(team.hostTeamMember, teamMemberToCancel);
  const teamMemberToCancelFullname = getFullname(teamMemberToCancel);

  const { cancelWholeTeam, remainingTeamMemberNames } = getTeamMemberCancelInfo(team, teamMemberToCancel);

  const {showSuccess, showError} = useCustomSnackbar();

  const handleCancelTeamMember = async() => {
    try  {
      const teamAfterCancel = await cancelTeamMemberAsync(adminId, team.id!, teamMemberToCancel.id!);
      showSuccess(t("admin:team_cancel_member_success_text", { fullname: teamMemberToCancelFullname }));
      onClose({ teamAfterCancel });
    } catch (e) {
      const issues = getIssuesUntranslated(e);
      if (findIssueByMessage(issues, CONSTANTS.VALIDATION_ISSUE_CONSTANTS.TEAM_NO_TEAM_MEMBERS_LEFT)) {
        navigateToCancelWholeTeam();
        return;
      }
      if (findIssueByMessage(issues, CONSTANTS.VALIDATION_ISSUE_CONSTANTS.INVALID_TEAM_MEMBER_CANCELLATION_ROOT_TEAMPARTNER)) {
        showError(t(`admin:${CONSTANTS.VALIDATION_ISSUE_CONSTANTS.INVALID_TEAM_MEMBER_CANCELLATION_ROOT_TEAMPARTNER}`, { fullname: getFullname(teamMemberToCancel) }), {
          autoHideDuration: 9000
        });
        return;
      }
      showHttpErrorDefaultNotification(e);
    }
  };

  const navigateToCancelWholeTeam = () => {
    onClose({ mustCancelWholeTeam: true });
  };

  const renderContent = () => {
    if (cancelWholeTeam) {
      return renderContentForWholeTeamCancel();
    } else {
      return renderContentForTeamMemberCancel();
    }
  };

  const renderContentForWholeTeamCancel = () => {
    return (
      <Box mt={1}>
        <Span i18n="admin:team_member_cancel_whole_team" parameters={{ teamMemberToCancel: teamMemberToCancelFullname }} html={true} />
      </Box>
    );
  };

  const renderContentForTeamMemberCancel = () => {
    const remainingTeamMemberNamesAsStr = remainingTeamMemberNames.join(", ");
    return (
      <Box mt={1}>
        <Box>
          <Span html={true} i18n="admin:team_member_cancel_info"
                parameters={{ teamMemberToCancel: teamMemberToCancelFullname, remainingTeamMemberNames: remainingTeamMemberNamesAsStr }} />
        </Box>
        { teamMemberToCancelIsHost && <Span>
                                        <br />
                                        <strong>{t('admin:attention')}</strong> <span>{t('team_member_cancel_host_info')}</span>
                                      </Span> }
      </Box>
    );
  };

  const cancelDialog = () => {
    onClose();
  }

  if (!isOpen) {
    return null;
  }
  return (
      <Dialog open={true} onClose={cancelDialog} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={cancelDialog}>{t('team_member_cancel', {teamMemberToCancel: teamMemberToCancelFullname})}</DialogTitleCloseable>
        <DialogContent>
          { renderContent() }
        </DialogContent>
        { !cancelWholeTeam && <DialogActionsPanel onOk={handleCancelTeamMember} onCancel={cancelDialog} okLabel={t('admin:team_member_cancel_delete')} cancelLabel={t('common:cancel')} danger={true}/> }
        { cancelWholeTeam && <DialogActionsPanel onOk={navigateToCancelWholeTeam} onCancel={cancelDialog} okLabel={t('admin:team_member_cancel_goto_team_cancel')} cancelLabel={t('common:cancel')} danger={true}/>}
      </Dialog>
  );
};
