import { Box } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';
import {
  BaseAdminIdProps,
  HttpError,
  reCreateTeamArrangementsAsync,
  useDisclosure,
  findAdminActivitiesByAdminIdAndTypesAsync,
  filterActivitiesByType,
  ActivityType,
  useBackendIssueHandler,
  dropTeamArrangementsAsync,
  useUpdateFindTeamsQueryData
}
  from '@runningdinner/shared';
import { useTranslation, Trans } from 'react-i18next';
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import Paragraph from '../../common/theme/typography/Paragraph';
import DropdownButton from '../../common/theme/dropdown/DropdownButton';
import DropdownButtonItem from '../../common/theme/dropdown/DropdownButtonItem';
import { useUrlQuery } from '../../common/hooks/useUrlQuery';
import { OPEN_DROP_TEAMS_DIALOG_QUERY_PARAM } from '../AdminNavigationHook';
import { useEffect } from 'react';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';


export interface TeamArrangementActionsButtonProps extends BaseAdminIdProps {
}

interface TeamArrangementActionConfirmationData {
  showTeamArrangementMailsSentWarning?: boolean;
  showDinnerRouteMailsSentWarning?: boolean;
  message: string;
}

enum TEAM_ARRANGEMENT_ACTION {
  REGENERATE,
  DROP
}

export function TeamArrangementActionsButton({adminId}: TeamArrangementActionsButtonProps) {

  const {t} = useTranslation(["admin", "common"]);

  const query = useUrlQuery();

  const {updateTeams} = useUpdateFindTeamsQueryData(adminId);

  const {showSuccess} = useCustomSnackbar();

  const initiallyShowDropTeamsDialog = query.get(OPEN_DROP_TEAMS_DIALOG_QUERY_PARAM);

  const {isOpen: showRegenerateTeamsConfirmation, 
         open: openRegenerateTeamsConfirmation, 
         getIsOpenData: getRegenerateTeamsConfirmationData, 
         close: closeRegenerateTeamsConfirmation } = useDisclosure<TeamArrangementActionConfirmationData>();

  const {isOpen: showDropTeamsConfirmation, 
         open: openDropTeamsConfirmation, 
         getIsOpenData: getDropTeamsConfirmationData, 
         close: closeDropTeamsConfirmation } = useDisclosure<TeamArrangementActionConfirmationData>();

  async function handleOpenTeamArrangementActionConfirmationDialog(action: TEAM_ARRANGEMENT_ACTION) {
    const activityList = await findAdminActivitiesByAdminIdAndTypesAsync(adminId, [ActivityType.TEAMARRANGEMENT_MAIL_SENT, ActivityType.DINNERROUTE_MAIL_SENT]);
    const activities = activityList.activities || [];

    const teamArrangementActionConfirmationData = {
      showTeamArrangementMailsSentWarning: filterActivitiesByType(activities, ActivityType.TEAMARRANGEMENT_MAIL_SENT).length > 0,
      showDinnerRouteMailsSentWarning: filterActivitiesByType(activities, ActivityType.DINNERROUTE_MAIL_SENT).length > 0,
      message: "admin:teams_reset_confirmation"
    };
    if (action === TEAM_ARRANGEMENT_ACTION.REGENERATE) {
      openRegenerateTeamsConfirmation(teamArrangementActionConfirmationData);
    } else {
      teamArrangementActionConfirmationData.message = "admin:teams_drop_confirmation";
      openDropTeamsConfirmation(teamArrangementActionConfirmationData);
    }
  }

  useEffect(() => {
    if (initiallyShowDropTeamsDialog === 'true') {
      handleOpenTeamArrangementActionConfirmationDialog(TEAM_ARRANGEMENT_ACTION.DROP);
    }
  }, [initiallyShowDropTeamsDialog]);


  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  async function handleRegenerateTeamsConfirmationDialogClosed(confirmed: boolean) {
    if (!confirmed) {
      closeRegenerateTeamsConfirmation();
      return;
    }
    try {
      const newTeamArrangements = await reCreateTeamArrangementsAsync(adminId);
      closeRegenerateTeamsConfirmation();
      updateTeams(newTeamArrangements.teams);
      showSuccess(t("admin:teams_reset_success_text"));
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  async function handleDropTeamsConfirmationDialogClosed(confirmed: boolean) {
    if (!confirmed) {
      closeDropTeamsConfirmation();
      return;
    }
    try {
      const newTeamArrangements = await dropTeamArrangementsAsync(adminId);
      closeDropTeamsConfirmation();
      updateTeams(newTeamArrangements.teams);
      showSuccess(t("admin:teams_drop_success_text"));
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }


  function renderConfirmationDialogContent({showDinnerRouteMailsSentWarning, showTeamArrangementMailsSentWarning, message}: TeamArrangementActionConfirmationData) {
    return (
      <>
        <Paragraph i18n={message} />
        <br/>
        <Paragraph html={true} i18n={"admin:teams_reset_hint_team_partner_wish"} />

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
      <DropdownButton label={t('admin:teams_arrangement_action_button')} color='secondary'>
        <DropdownButtonItem onClick={() => handleOpenTeamArrangementActionConfirmationDialog(TEAM_ARRANGEMENT_ACTION.REGENERATE)}>
          {t('admin:teams_reset')}...
        </DropdownButtonItem>
        <DropdownButtonItem onClick={() => handleOpenTeamArrangementActionConfirmationDialog(TEAM_ARRANGEMENT_ACTION.DROP)}>
          {t('admin:teams_drop')}...
        </DropdownButtonItem>
      </DropdownButton>
      { showRegenerateTeamsConfirmation && <ConfirmationDialog onClose={handleRegenerateTeamsConfirmationDialogClosed} 
                                                               dialogContent={renderConfirmationDialogContent(getRegenerateTeamsConfirmationData())}
                                                               dialogTitle={t('admin:teams_reset')}
                                                               danger={true}
                                                               buttonConfirmText={t('admin:teams_reset')}
                                                               buttonCancelText={t('common:cancel')} /> }

      { showDropTeamsConfirmation && <ConfirmationDialog onClose={handleDropTeamsConfirmationDialogClosed} 
                                                         dialogContent={renderConfirmationDialogContent(getDropTeamsConfirmationData())}
                                                         dialogTitle={t('admin:teams_drop')}
                                                         danger={true}
                                                         buttonConfirmText={t('admin:teams_drop')}
                                                         buttonCancelText={t('common:cancel')} /> }
    </>
  );
}