import React from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import {useTranslation} from "react-i18next";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {Span} from "../../../common/theme/typography/Tags";
import {
  isStringEmpty,
  CONSTANTS,
  deleteParticipantAsync,
  getFullname,
  useBackendIssueHandler, findIssueByMessage
} from "@runningdinner/shared";
import {useAdminNavigation} from "../../AdminNavigationHook";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";

export const DeleteParticipantDialog = ({adminId, participant, open, onClose}) => {

  const {t} = useTranslation(['admin', 'common']);
  const {showSuccess} = useCustomSnackbar();
  const {navigateToTeamMemberCancellation} = useAdminNavigation();
  const {getIssuesUntranslated, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const deleteParticipant = async () => {
    try {
      const deletedParticipant = await deleteParticipantAsync(adminId, participant);
      showSuccess(getFullname(participant) + " erfolgreich gelöscht");
      onClose(deletedParticipant);
    } catch (e) {
      const issues = getIssuesUntranslated(e);
      if (findIssueByMessage(issues, CONSTANTS.VALIDATION_ISSUE_CONSTANTS.PARTICIPANT_ASSINGED_IN_TEAM)) {
        onClose(null);
        cancelTeamMember(adminId, participant);
      }
      showHttpErrorDefaultNotification(e);
    }
  };

  function cancelTeamMember() {
    cancel();
    navigateToTeamMemberCancellation(adminId, participant);
  }

  function cancel() {
    onClose(null);
  }

  const fullName = getFullname(participant);
  const isAssignedToTeam = !isStringEmpty(participant.teamId);

  return (
      <Dialog open={open} onClose={cancel}>
        <DialogTitleCloseable onClose={cancel}>
          {t('participant_deletion_confirmation_headline', {fullname: fullName})}
        </DialogTitleCloseable>
        <DialogContent>
          <Span i18n={"admin:participant_deletion_confirmation_text"} parameters={{ fullname: fullName }} />
          {isAssignedToTeam &&
              <Span>
                <strong>{t('common:note')}</strong>: {t('admin:participant_deletion_confirmation_team_hint')}
              </Span>
          }
        </DialogContent>
        { !isAssignedToTeam && <DialogActionsPanel onOk={deleteParticipant} onCancel={cancel} okLabel={t('common:delete')} cancelLabel={t('common:cancel')} danger={true}/> }
        { isAssignedToTeam && <DialogActionsPanel onOk={cancelTeamMember} onCancel={cancel} okLabel={t('admin:participant_cancel')} cancelLabel={t('common:cancel')} danger={true}/>}
      </Dialog>
  );
};
