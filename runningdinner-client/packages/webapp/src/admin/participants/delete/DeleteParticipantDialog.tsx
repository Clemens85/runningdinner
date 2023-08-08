import React from 'react';
import {Box, Dialog, DialogContent } from '@mui/material';
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import {Trans, useTranslation} from "react-i18next";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {Span} from "../../../common/theme/typography/Tags";
import {
  isStringEmpty,
  CONSTANTS,
  deleteParticipantAsync,
  getFullname,
  useBackendIssueHandler,
  findIssueByMessage,
  BaseAdminIdProps,
  ParticipantListable,
  Participant,
  isTeamPartnerWishRegistration, isTeamPartnerWishChild, isTeamPartnerWishRoot
} from "@runningdinner/shared";
import {useAdminNavigation} from "../../AdminNavigationHook";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import { Alert } from '@mui/material';

type DeleteParticipantDialogProps = {
  participant: ParticipantListable;
  onClose: (deletedParticipant: Participant | null) => unknown;
  open: boolean;
} & BaseAdminIdProps;

export const DeleteParticipantDialog = ({adminId, participant, open, onClose}: DeleteParticipantDialogProps) => {

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
      showSuccess(t("admin:delete_participant_success_message", {fullname: getFullname(participant) }));
      onClose(deletedParticipant);
    } catch (e) {
      const issues = getIssuesUntranslated(e);
      if (findIssueByMessage(issues, CONSTANTS.VALIDATION_ISSUE_CONSTANTS.PARTICIPANT_ASSINGED_IN_TEAM)) {
        onClose(null);
        cancelTeamMember();
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
      <Dialog open={open} onClose={cancel} data-testid={"delete-participant-dialog"}>
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
          <TeamPartnerWishRegistrationInfo {...participant} />
        </DialogContent>
        { !isAssignedToTeam && <DialogActionsPanel onOk={deleteParticipant} onCancel={cancel} okLabel={t('common:delete')} cancelLabel={t('common:cancel')} danger={true}/> }
        { isAssignedToTeam && <DialogActionsPanel onOk={cancelTeamMember} onCancel={cancel} okLabel={t('admin:participant_cancel')} cancelLabel={t('common:cancel')} danger={true}/>}
      </Dialog>
  );
};

function TeamPartnerWishRegistrationInfo(participant: ParticipantListable) {

  if (!isTeamPartnerWishRegistration(participant)) {
    return null;
  }

  if (isTeamPartnerWishChild(participant)) {
    return (
      <Box mt={2}>
        <Alert severity={"info"} variant="outlined">
          <Trans i18nKey={"admin:team_partner_wish_registration_delete_child"}
                 values={{ fullname: getFullname(participant), root_fullname: getFullname(participant.rootTeamPartnerWish!) }} />
        </Alert>
      </Box>
    );
  } else if (isTeamPartnerWishRoot(participant)) {
    return (
      <Box mt={2}>
        <Alert severity={"warning"} variant="outlined">
          <Trans i18nKey={"admin:team_partner_wish_registration_delete_root"}
                 values={{ fullname: getFullname(participant), child_fullname: getFullname(participant.childTeamPartnerWish!) }} />
        </Alert>
      </Box>
    );
  } else {
    return null;
  }


}
