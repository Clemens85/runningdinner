import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, Box, DialogActions, useTheme, useMediaQuery } from '@mui/material';
import { DialogTitleCloseable } from '../../../common/theme/DialogTitleCloseable';
import React from 'react';
import { Span } from '../../../common/theme/typography/Tags';
import SecondaryButton from '../../../common/theme/SecondaryButton';
import { GridWithCenteredFullwidthButton } from '../../../common/theme/CommonStyles';
import { PrimarySuccessButtonAsync } from '../../../common/theme/PrimarySuccessButtonAsync';
import {
  handleTeamPartnerWishAction,
  newParticipantTeamPartnerWishAction,
  noTeamPartnerWishAction,
  sendInvitationTeamPartnerWishAction,
  updateMatchingParticipantTeamPartnerWishAction,
} from './TeamPartnerWishAction';
import { SecondaryButtonAsync } from '../../../common/theme/SecondaryButtonAsync';
import Grid from '@mui/material/Grid';
import { getFullname, isClosedDinner, CONSTANTS } from '@runningdinner/shared';
import { useCustomSnackbar } from '../../../common/theme/CustomSnackbarHook';
import { styled } from '@mui/material';

export const TeamPartnerWishDialog = ({ runningDinner, teamPartnerWishInfo, isOpen, onClose }) => {
  const participant = teamPartnerWishInfo.subscribedParticipant;

  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess } = useCustomSnackbar();
  const fullname = getFullname(participant);
  const { adminId } = runningDinner;

  const isClosed = isClosedDinner(runningDinner);
  const teamPartnerWishNotExisting = teamPartnerWishInfo.state === CONSTANTS.TEAM_PARTNER_WISH_STATE.NOT_EXISTING;
  const teamPartnerWishIsEmpty = teamPartnerWishInfo.state === CONSTANTS.TEAM_PARTNER_WISH_STATE.EXISTS_EMPTY_TEAM_PARTNER_WISH;

  const showCreateNewParticipantButton = teamPartnerWishNotExisting;
  const showSendTeamPartnerWishInvitationButton = !isClosed && teamPartnerWishNotExisting;
  const showUpdateTeamPartnerWishButton = teamPartnerWishIsEmpty;

  const renderTeamPartnerWishNotExisting = () => {
    return (
      <>
        <Span i18n="admin:team_partner_wish_not_existing_text" parameters={{ teamPartnerWish: participant.teamPartnerWishEmail }} html={true} />
        <br />
        {!isClosed && (
          <>
            <Span i18n="admin:team_partner_wish_not_existing_send_email_text" html={true} />
            <Span i18n="admin:team_partner_wish_not_existing_create_public_text" html={true} />
          </>
        )}
        {isClosed && <Span i18n="admin:team_partner_wish_not_existing_create_closed_text" />}
      </>
    );
  };

  const renderTeamPartnerWishIsEmpty = () => {
    const matchingParticipantFullname = getFullname(teamPartnerWishInfo.matchingParticipant);
    return <Span i18n="admin:team_partner_wish_existing_text" parameters={{ matchingParticipant: matchingParticipantFullname, participant: fullname }} html={true} />;
  };

  const handleSendInvitationEMail = () => {
    const sendInvitationAction = sendInvitationTeamPartnerWishAction(participant);
    handleTeamPartnerWishAction(adminId, sendInvitationAction).then((result) => {
      showSuccess(t('admin:participant_teampartnerwish_sent_invitation', { email: participant.teamPartnerWishEmail }));
      onClose(result);
    });
  };

  const handleUpdateMatchingParticipant = () => {
    const updateOtherParticipantAction = updateMatchingParticipantTeamPartnerWishAction(participant, teamPartnerWishInfo.matchingParticipant);
    handleTeamPartnerWishAction(adminId, updateOtherParticipantAction).then((result) => {
      showSuccess(
        t('admin:participant_teampartnerwish_update_participant', {
          fullnameThis: getFullname(participant),
          fullnameOther: getFullname(teamPartnerWishInfo.matchingParticipant),
        }),
      );
      onClose(result);
    });
  };

  const handleNewParticipant = () => {
    const newParticipantAction = newParticipantTeamPartnerWishAction(participant);
    handleTeamPartnerWishAction(adminId, newParticipantAction).then((result) => {
      showSuccess(t('admin:participant_teampartnerwish_new_participant'));
      onClose(result);
    });
  };

  const onCancel = () => {
    onClose(noTeamPartnerWishAction());
  };

  if (!isOpen) {
    return null;
  }
  return (
    <Dialog open={true} onClose={onCancel} aria-labelledby="form-dialog-title" maxWidth={'md'} fullWidth={true}>
      <DialogTitleCloseable onClose={onCancel}>{t('admin:participant_save_success', { fullname: fullname })}</DialogTitleCloseable>
      <DialogContent>
        <Box>
          {teamPartnerWishNotExisting && renderTeamPartnerWishNotExisting()}
          {teamPartnerWishIsEmpty && renderTeamPartnerWishIsEmpty()}
        </Box>
      </DialogContent>
      <DialogActions>
        <DialogButtons
          cancelButton={<SecondaryButton onClick={onCancel}>{t('common:no_thanks')}</SecondaryButton>}
          sendInvitationButton={
            showSendTeamPartnerWishInvitationButton && (
              <SecondaryButtonAsync onClick={handleSendInvitationEMail} variant="contained" color={'inherit'}>
                {t('admin:team_partner_wish_send_invitation_email')}
              </SecondaryButtonAsync>
            )
          }
          createNewParticipantButton={
            showCreateNewParticipantButton && (
              <PrimarySuccessButtonAsync onClick={handleNewParticipant}>
                {t('admin:team_partner_wish_create')} {!showSendTeamPartnerWishInvitationButton && <>({t('common:recommended')})</>}
              </PrimarySuccessButtonAsync>
            )
          }
          updateTeamPartnerWishButton={
            showUpdateTeamPartnerWishButton && (
              <PrimarySuccessButtonAsync onClick={handleUpdateMatchingParticipant}>
                {t('admin:team_partner_wish_add')} ({t('common:recommended')})
              </PrimarySuccessButtonAsync>
            )
          }
        />
      </DialogActions>
    </Dialog>
  );
};

const SendInvitationButtonSpan = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(1),
}));

function DialogButtons({ sendInvitationButton, createNewParticipantButton, updateTeamPartnerWishButton, cancelButton }) {
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));

  const renderButtonsDesktop = () => {
    return (
      <Box p={2}>
        {cancelButton}
        {sendInvitationButton && <SendInvitationButtonSpan>{sendInvitationButton}</SendInvitationButtonSpan>}
        {createNewParticipantButton}
        {updateTeamPartnerWishButton}
      </Box>
    );
  };

  const renderButtonsMobile = () => {
    return (
      <Box p={1}>
        <Grid container direction="column" justifyContent="space-evenly" alignItems="center" spacing={1}>
          {createNewParticipantButton && <GridWithCenteredFullwidthButton size={12}>{createNewParticipantButton}</GridWithCenteredFullwidthButton>}
          {sendInvitationButton && <GridWithCenteredFullwidthButton size={12}>{sendInvitationButton}</GridWithCenteredFullwidthButton>}
          {updateTeamPartnerWishButton && <GridWithCenteredFullwidthButton size={12}>{updateTeamPartnerWishButton}</GridWithCenteredFullwidthButton>}
          <Grid sx={{ textAlign: 'center' }} size={12}>
            {cancelButton}
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (isDesktopView) {
    return renderButtonsDesktop();
  } else {
    return renderButtonsMobile();
  }
}
