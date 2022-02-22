import { Box, Button } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { BaseAdminIdProps, HttpError, reCreateTeamArrangementsAsync, useDisclosure, 
        findAdminActivitiesByAdminIdAndTypesAsync, TeamArrangementList, filterActivitiesByType, ActivityType } 
        from '@runningdinner/shared';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import Paragraph from '../../common/theme/typography/Paragraph';


export interface RegenerateTeamsButtonProps extends BaseAdminIdProps {
  onTeamsRegenerated: (teamArrangementList: TeamArrangementList) => unknown;
}

interface RegenerateTeamsConfirmationData {
  showTeamArrangementMailsSentWarning?: boolean;
  showDinnerRouteMailsSentWarning?: boolean;
}

export function RegenerateTeamsButton({adminId, onTeamsRegenerated}: RegenerateTeamsButtonProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {isOpen, open, getIsOpenData, close} = useDisclosure<RegenerateTeamsConfirmationData>();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  async function handleOpenRegenerateTeamsConfirmationDialog() {
    const activityList = await findAdminActivitiesByAdminIdAndTypesAsync(adminId, [ActivityType.TEAMARRANGEMENT_MAIL_SENT, ActivityType.DINNERROUTE_MAIL_SENT]);
    const activities = activityList.activities || [];
    open({
      showTeamArrangementMailsSentWarning: filterActivitiesByType(activities, ActivityType.TEAMARRANGEMENT_MAIL_SENT).length > 0,
      showDinnerRouteMailsSentWarning: filterActivitiesByType(activities, ActivityType.DINNERROUTE_MAIL_SENT).length > 0
    });
  }

  async function handleRegenerateTeamsConfirmationDialogClosed(confirmed: boolean) {
    if (!confirmed) {
      close();
      return;
    }
    try {
      const newTeamArrangements = await reCreateTeamArrangementsAsync(adminId);
      close();
      onTeamsRegenerated(newTeamArrangements);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  function renderConfirmationDialogContent({showDinnerRouteMailsSentWarning, showTeamArrangementMailsSentWarning}: RegenerateTeamsConfirmationData) {
    return (
      <>
        <Paragraph i18n="admin:teams_reset_confirmation" />

        { showTeamArrangementMailsSentWarning && <Box my={2}>
                                                    <Alert severity={"warning"}>
                                                      <AlertTitle>{t('common:attention')}</AlertTitle>
                                                      <Trans i18nKey='admin:teams_reset_hint_team_messages_sent' />
                                                    </Alert>
                                                  </Box> }

        { showDinnerRouteMailsSentWarning && <Box my={2}>
                                                <Alert severity={"warning"}>
                                                  <AlertTitle>{t('common:attention')}</AlertTitle>
                                                  <Trans i18nKey='admin:teams_reset_hint_dinnerroute_messages_sent' />
                                                </Alert>
                                              </Box> }
      </>
    );
  }

  return (
    <>
      <Button onClick={handleOpenRegenerateTeamsConfirmationDialog} color="primary">{t('admin:teams_reset')}</Button>
      { isOpen && <ConfirmationDialog onClose={handleRegenerateTeamsConfirmationDialogClosed} 
                                      dialogContent={renderConfirmationDialogContent(getIsOpenData())}
                                      dialogTitle={t('admin:teams_reset')}
                                      danger={true}
                                      buttonConfirmText={t('admin:teams_reset')}
                                      buttonCancelText={t('common:cancel')} /> }
    </>
  );
}