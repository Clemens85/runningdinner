import {useTranslation} from "react-i18next";
import {
  Dialog,
  DialogContent,
  Box,
} from "@material-ui/core";
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import React from "react";
import {CONSTANTS, findItemBy, getFullname, getTeamMemberCancelInfo, isSameEntity, mapValidationIssuesToErrorObjects} from "@runningdinner/shared";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {Span} from "../../../common/theme/typography/Tags";
import {useSnackbar} from "notistack";

export const CANCEL_WHOLE_TEAM_RESULT = "cancelWholeTeam";

export const TeamMemberCancelDialog = ({adminId, team, teamMemberToCancel, isOpen, onClose}) => {

  const {t} = useTranslation(['admin', 'common']);

  const teamMemberToCancelIsHost = isSameEntity(team.hostTeamMember, teamMemberToCancel);
  const teamMemberToCancelFullname = getFullname(teamMemberToCancel);

  const { cancelWholeTeam, remainingTeamMemberNames } = getTeamMemberCancelInfo(team, teamMemberToCancel);

  const {enqueueSnackbar} = useSnackbar();

  const cancelTeamMemberAsync = async() => {
    try  {
      const updatedTeam = await cancelTeamMemberAsync(adminId, team.id, teamMemberToCancel.id);
      enqueueSnackbar(t("admin:team_cancel_member_success_text", { fullname: teamMemberToCancelFullname }),  {variant: "success"});
      onClose(updatedTeam);
    } catch (e) {
      const validationIssues = mapValidationIssuesToErrorObjects(e);
      if (findItemBy(validationIssues, "message", CONSTANTS.VALIDATION_ISSUE_CONSTANTS.TEAM_NO_TEAM_MEMBERS_LEFT)) {
        navigateToCancelWholeTeam();
        return;
      }
      // TODO: What happens with other errors?!
      throw e;
    }
  };

  const navigateToCancelWholeTeam = () => {
    onClose(CANCEL_WHOLE_TEAM_RESULT);
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

  if (!isOpen) {
    return null;
  }
  return (
      <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={onClose}>{t('team_member_cancel', {teamMemberToCancel: teamMemberToCancelFullname})}</DialogTitleCloseable>
        <DialogContent>
          { renderContent() }
        </DialogContent>
        { !cancelWholeTeam && <DialogActionsPanel onOk={cancelTeamMemberAsync} onCancel={onClose} okLabel={t('admin:team_member_cancel_delete')} cancelLabel={t('common:cancel')} danger={true}/> }
        { cancelWholeTeam && <DialogActionsPanel onOk={navigateToCancelWholeTeam} onCancel={onClose} okLabel={t('admin:team_member_cancel_goto_team_cancel')} cancelLabel={t('common:cancel')} danger={true}/>}
      </Dialog>
  );
};
