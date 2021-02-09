import React from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {Span} from "../../../common/theme/typography/Tags";
import {findItemBy, isStringEmpty, mapValidationIssuesToErrorObjects, CONSTANTS, deleteParticipantAsync, getFullname} from "@runningdinner/shared";
import {useHistory} from "react-router-dom";
import {generateParticipantCancellationPath} from "../../../common/NavigationService";

export const DeleteParticipantDialog = ({adminId, participant, open, onClose}) => {

  const {t} = useTranslation(['admin', 'common']);
  const {enqueueSnackbar} = useSnackbar();
  const history = useHistory();

  const deleteParticipant = async () => {
    try {
      const deletedParticipant = await deleteParticipantAsync(adminId, participant);
      enqueueSnackbar(getFullname(participant) + " erfolgreich gelöscht", {variant: "success"});
      onClose(deletedParticipant);
    } catch (e) {
      const validationIssues = mapValidationIssuesToErrorObjects(e);
      if (findItemBy(validationIssues, "message", CONSTANTS.VALIDATION_ISSUE_CONSTANTS.PARTICIPANT_ASSINGED_IN_TEAM)) {
        onClose(null);
        cancelTeamMember(adminId, participant);
      }
    }
  };

  function cancelTeamMember() {
    history.push(generateParticipantCancellationPath(adminId, participant));
  }

  function cancel() {
    onClose(null);
  }

  const fullName = getFullname(participant);
  const isAssignedToTeam = !isStringEmpty(participant.teamId);

  return (
      <Dialog open={open} onClose={cancel} aria-labelledby="form-dialog-title">
        <DialogTitleCloseable id="edit-meals-dialog-title" onClose={cancel}>
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
