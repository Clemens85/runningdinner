import { Dialog, DialogContent } from '@material-ui/core';
import {
  findTeamsForWaitingListAsync,
  isArrayNotEmpty,
  Team,
  CallbackHandler,
  getWaitingListParticipantsAssignableToTeams
} from '@runningdinner/shared';
import DialogActionsPanel from '../../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../../common/theme/DialogTitleCloseable';
import { Fetch } from '../../../common/Fetch';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WaitingListManagementBaseProps } from './WaitingListManagementAlert';


interface WaitingListManagementDialogProps extends WaitingListManagementBaseProps {
  onCancel: CallbackHandler;
  onSave: CallbackHandler;
}

export function WaitingListManagementDialog(props: WaitingListManagementDialogProps) {
  
  const {t} = useTranslation(["admin", "common"]);

  const {runningDinner, onCancel, onSave} = props

  return (
    <Dialog onClose={onCancel} open={true}>
      <DialogTitleCloseable onClose={onCancel}>{t('Wartelisten-Verwaltung')}</DialogTitleCloseable>
      <DialogContent>
        <Fetch asyncFunction={findTeamsForWaitingListAsync}
               parameters={[runningDinner.adminId]}
               render={response =>
                  <WaitingListManagementDialogContentView {...props} teamsWithCancelStatusOrCancelledMembers={response.result} />
               } />;
      </DialogContent>
      <DialogActionsPanel onOk={onSave} 
                          onCancel={onCancel}
                          okLabel={t('common:save')}
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}

interface WaitingListManagementDialogContentViewProps extends WaitingListManagementDialogProps {
  teamsWithCancelStatusOrCancelledMembers: Team[];
}

function WaitingListManagementDialogContentView(props: WaitingListManagementDialogContentViewProps) {

  const {runningDinner, teamsWithCancelStatusOrCancelledMembers, participantsNotAssignable} = props;

  if (isArrayNotEmpty(teamsWithCancelStatusOrCancelledMembers)) {
    return <AssignParticipantsToTeamsView {...props} />
  } else {
    const waitingListParticipantsAssignableToTeams = getWaitingListParticipantsAssignableToTeams(runningDinner, participantsNotAssignable);
    if (isArrayNotEmpty(waitingListParticipantsAssignableToTeams.participantsAssignable)) {
      <RegenerateTeamsWithAssignableParticipantsView />
    } else {
      
    }
  }

  return (
    <></>
  );
}

function AssignParticipantsToTeamsView({teamsWithCancelStatusOrCancelledMembers, participantsNotAssignable}: WaitingListManagementDialogContentViewProps) {
  return (
    <>
    </>
  );
}

function RegenerateTeamsWithAssignableParticipantsView() {
  return (
    <>
    </>
  );
}

