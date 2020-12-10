import {useTranslation} from "react-i18next";
import ParticipantService from "shared/admin/ParticipantService";
import {
  Dialog,
  DialogContent,
  Box, DialogActions, useTheme, useMediaQuery, makeStyles,
} from "@material-ui/core";
import {DialogTitleCloseable} from "common/theme/DialogTitleCloseable";
import React from "react";
import {Span} from "common/theme/typography/Tags";
import SecondaryButton from "common/theme/SecondaryButton";
import {PrimarySuccessButtonAsync} from "common/theme/PrimarySuccessButtonAsync";
import RunningDinnerService from "shared/admin/RunningDinnerService";
import {CONSTANTS} from "shared/Constants";
import {
  handleTeamPartnerWishAction,
  newParticipantTeamPartnerWishAction,
  noTeamPartnerWishAction,
  sendInvitationTeamPartnerWishAction,
  updateMatchingParticipantTeamPartnerWishAction
} from "admin/participants/teampartnerwish/TeamPartnerWishAction";
import {useSnackbar} from "notistack";
import {SecondaryButtonAsync} from "common/theme/SecondaryButtonAsync";
import Grid from "@material-ui/core/Grid";
import useCommonStyles from "common/theme/CommonStyles";

export const TeamPartnerWishDialog = ({runningDinner, teamPartnerWishInfo, isOpen, onClose}) => {

  const participant = teamPartnerWishInfo.subscribedParticipant;

  const {t} = useTranslation(['admin', 'common']);
  const {enqueueSnackbar} = useSnackbar();
  const fullname = ParticipantService.getFullname(participant);
  const {adminId} = runningDinner;

  const isClosedDinner = RunningDinnerService.isClosedDinner(runningDinner);
  const teamPartnerWishNotExisting = teamPartnerWishInfo.state === CONSTANTS.TEAM_PARTNER_WISH_STATE.NOT_EXISTING;
  const teamPartnerWishIsEmpty = teamPartnerWishInfo.state === CONSTANTS.TEAM_PARTNER_WISH_STATE.EXISTS_EMPTY_TEAM_PARTNER_WISH;

  const showCreateNewParticipantButton = teamPartnerWishNotExisting;
  const showSendTeamPartnerWishInvitationButton = !isClosedDinner && teamPartnerWishNotExisting;
  const showUpdateTeamPartnerWishButton = teamPartnerWishIsEmpty;

  const renderTeamPartnerWishNotExisting = () => {
    return (
      <>
        <Span i18n="admin:team_partner_wish_not_existing_text" parameters={{ teamPartnerWish: participant.teamPartnerWish }} html={true} /><br />
        { !isClosedDinner &&
          <>
            <Span i18n="admin:team_partner_wish_not_existing_send_email_text" html={true} />
            <Span i18n="admin:team_partner_wish_not_existing_create_public_text" html={true} />
          </> }
        { isClosedDinner && <Span i18n="admin:team_partner_wish_not_existing_create_closed_text" />}
      </>
    );
  };

  const renderTeamPartnerWishIsEmpty = () => {
    const matchingParticipantFullname = ParticipantService.getFullname(teamPartnerWishInfo.matchingParticipant);
    return <Span i18n="admin:team_partner_wish_existing_text"
                 parameters={{ matchingParticipant: matchingParticipantFullname, participant: fullname }}
                 html={true} />;
  };

  const handleSendInvitationEMail = () => {
    const sendInvitationAction = sendInvitationTeamPartnerWishAction(participant);
    handleTeamPartnerWishAction(adminId, sendInvitationAction).then(result => {
      enqueueSnackbar(t("admin:participant_teampartnerwish_sent_invitation", {email: participant.teamPartnerWish}), {variant: "success"});
      onClose(result);
    });
  };

  const handleUpdateMatchingParticipant = () => {
    const updateOtherParticipantAction = updateMatchingParticipantTeamPartnerWishAction(participant, teamPartnerWishInfo.matchingParticipant);
    handleTeamPartnerWishAction(adminId, updateOtherParticipantAction).then(result => {
      enqueueSnackbar(t("admin:participant_teampartnerwish_update_participant", {
        fullnameThis: ParticipantService.getFullname(participant),
        fullnameOther: ParticipantService.getFullname(teamPartnerWishInfo.matchingParticipant)
      }), {variant: "success"});
      onClose(result);
    });
  };

  const handleNewParticipant = () => {
    const newParticipantAction = newParticipantTeamPartnerWishAction(participant);
    handleTeamPartnerWishAction(adminId, newParticipantAction).then(result => {
      enqueueSnackbar(t('admin:participant_teampartnerwish_new_participant'), {variant: "success"});
      onClose(result);
    });
  };

  const onCancel = () => {
    onClose(noTeamPartnerWishAction());
  }

  if (!isOpen) {
    return null;
  }
  return (
      <Dialog open={true} onClose={onCancel} aria-labelledby="form-dialog-title" maxWidth={"md"} fullWidth={true}>
        <DialogTitleCloseable onClose={onCancel}>{t('admin:participant_save_success', {fullname: fullname})}</DialogTitleCloseable>
        <DialogContent>
          <Box>
            { teamPartnerWishNotExisting && renderTeamPartnerWishNotExisting() }
            { teamPartnerWishIsEmpty && renderTeamPartnerWishIsEmpty() }
          </Box>
        </DialogContent>
        <DialogActions>
          <DialogButtons cancelButton={ <SecondaryButton onClick={onCancel}>{t('common:no_thanks')}</SecondaryButton> }
                         sendInvitationButton={ showSendTeamPartnerWishInvitationButton && <SecondaryButtonAsync onClick={handleSendInvitationEMail} variant="contained">
                                                                                              {t('admin:team_partner_wish_send_invitation_email')}
                                                                                            </SecondaryButtonAsync> }
                         createNewParticipantButton={ showCreateNewParticipantButton && <PrimarySuccessButtonAsync onClick={handleNewParticipant}>
                                                                                          {t('admin:team_partner_wish_create')} {!showSendTeamPartnerWishInvitationButton && <>({t('common:recommended')})</> }
                                                                                        </PrimarySuccessButtonAsync> }
                         updateTeamPartnerWishButton={ showUpdateTeamPartnerWishButton && <PrimarySuccessButtonAsync onClick={handleUpdateMatchingParticipant}>
                                                                                            {t('admin:team_partner_wish_add')} ({t('common:recommended')})
                                                                                         </PrimarySuccessButtonAsync> } />
        </DialogActions>
      </Dialog>
  );
};


const useDialogButtonStyles = makeStyles((theme) => ({
  sendInvitationButtonMargins: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  fullWidthButtonContainerMobile: {
    '& button': {
      width: "100%"
    }
  }
}));

function DialogButtons({sendInvitationButton, createNewParticipantButton, updateTeamPartnerWishButton, cancelButton}) {

  const dialogButtonStyles = useDialogButtonStyles();
  const commonStyles = useCommonStyles();

  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));

  const renderButtonsDesktop = () => {
    return (
      <Box p={2}>
        { cancelButton }
        { sendInvitationButton && <span className={dialogButtonStyles.sendInvitationButtonMargins}>{ sendInvitationButton }</span> }
        { createNewParticipantButton }
        { updateTeamPartnerWishButton }
      </Box>
    );
  };

  const renderButtonsMobile = () => {
    return (
      <Box p={1}>
        <Grid container diretion="column" justify="space-evenly" alignItems="center" spacing={1}>
          { createNewParticipantButton && <Grid item xs={12} className={dialogButtonStyles.fullWidthButtonContainerMobile}>{ createNewParticipantButton }</Grid> }
          { sendInvitationButton && <Grid item xs={12} className={dialogButtonStyles.fullWidthButtonContainerMobile}>{ sendInvitationButton }</Grid> }
          { updateTeamPartnerWishButton && <Grid item xs={12} className={dialogButtonStyles.fullWidthButtonContainerMobile}>{ updateTeamPartnerWishButton }</Grid> }
          <Grid item xs={12} className={commonStyles.textAlignCenter}>{ cancelButton }</Grid>
        </Grid>
      </Box>
    )
  };

  if (isDesktopView) {
    return renderButtonsDesktop();
  } else {
    return renderButtonsMobile();
  }
}


