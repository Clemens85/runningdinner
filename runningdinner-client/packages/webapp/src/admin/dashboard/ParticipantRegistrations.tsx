import React, {useEffect} from 'react';
import {
  Activity, BaseAdminIdProps,
  BaseRunningDinnerProps, CallbackHandler,
  fetchNextParticipantActivities,
  getParticipantRegistrationActivitiesFetchSelector,
  isArrayNotEmpty,
  isParticipantRegistrationActivitiesEmpty, LocalDate, Time, updateParticipantSubscription,
  useAdminSelector, useDisclosure
} from "@runningdinner/shared";
import {
  Button,
  Dialog, DialogContent,
  LinearProgress,
  List, ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography
} from "@material-ui/core";
import {Span, Subtitle} from "../../common/theme/typography/Tags";
import {useDispatch} from "react-redux";
import {FetchStatus} from "@runningdinner/shared/src/redux";
import {Trans, useTranslation} from "react-i18next";
import LinkAction from "../../common/theme/LinkAction";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import DoneIcon from "@material-ui/icons/Done";
import {useAdminNavigation} from "../AdminNavigationHook";
import useCommonStyles from "../../common/theme/CommonStyles";

export function ParticipantRegistrations({runningDinner}: BaseRunningDinnerProps) {

  const dispatch = useDispatch();
  const {adminId} = runningDinner;

  const {data: participantActivityList, fetchStatus} = useAdminSelector(getParticipantRegistrationActivitiesFetchSelector);
  const hasNoRegistrations = useAdminSelector(isParticipantRegistrationActivitiesEmpty);
  const {t} = useTranslation(["admin", "common"]);

  const {isOpen, close, open, getIsOpenData} = useDisclosure<Activity>();

  const showMoreLink = participantActivityList?.hasMore;

  useEffect(() => {
    // dispatch(resetParticipantActivities());
    dispatch(fetchNextParticipantActivities({adminId, initialFetch: true}));
  }, [adminId, dispatch]);

  return (
    <>
      <Subtitle i18n={"admin:latest_registrations"} />
      { fetchStatus === FetchStatus.LOADING && <LinearProgress variant={"indeterminate"} /> }
      { hasNoRegistrations && <NoRegistrations /> }
      { isArrayNotEmpty(participantActivityList?.activities) &&
        <List>
          { participantActivityList!.activities.map((activity, index) => <ParticipantRegistrationRow key={index}
                                                                                                                     adminId={adminId}
                                                                                                                     participantActivity={activity}
                                                                                                                     onShowConfirmSubscriptionActivationDialog={() => open(activity)} />) }
        </List>
      }
      { showMoreLink &&
        <div>
          <Button onClick={() => dispatch(fetchNextParticipantActivities({adminId}))}
                  variant={"outlined"}
                  fullWidth
                  color={"primary"}>{t("common:show_more")}</Button>
        </div>
       }

      { isOpen && <ConfirmParticipantActivationDialog participantActivity={getIsOpenData()}
                                                      adminId={adminId}
                                                      onClose={close} /> }
    </>
  );
}

interface ParticipantRegistrationRowProps extends BaseAdminIdProps {
  participantActivity: Activity;
  onShowConfirmSubscriptionActivationDialog: CallbackHandler;
}
function ParticipantRegistrationRow({participantActivity, onShowConfirmSubscriptionActivationDialog, adminId}: ParticipantRegistrationRowProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {activityDate, originator, relatedEntityId: participantId, relatedParticipantNotActivated} = participantActivity;
  const {navigateToParticipant} = useAdminNavigation();
  const commonStyles = useCommonStyles();

  function renderParticipantActivityDetails() {
    return (
      <>
        <LocalDate date={activityDate} /> {t("common:at_time")} <Time date={activityDate} />
        { relatedParticipantNotActivated &&
          <>
            <br/>
            <Typography variant="caption"><i>{t("admin:registration_not_yet_confirmed")}</i></Typography>
          </> }
      </>
    );
  }

  function handleClick() {
    if (relatedParticipantNotActivated) {
      return;
    }
    navigateToParticipant(adminId, participantId);
  }

  return (
    <ListItem divider={true} onClick={handleClick} className={`${relatedParticipantNotActivated ? '' : commonStyles.cursorPointer}`}>
      <ListItemText primary={<Typography variant={"subtitle2"}>{originator}</Typography>}
                    secondary={renderParticipantActivityDetails()} />
      { relatedParticipantNotActivated ?
        <ListItemSecondaryAction>
          <LinkAction onClick={onShowConfirmSubscriptionActivationDialog}>{t("admin:participant_subscription_activation_manual")}</LinkAction>
        </ListItemSecondaryAction> :
        <DoneIcon color={"primary"} />
      }
    </ListItem>
  );
}

function NoRegistrations() {
  return (
    <div>
      <Span i18n={"admin:no_registrations"} />
    </div>
  );
}

interface ConfirmParticipantActivationDialogProps extends BaseAdminIdProps {
  participantActivity: Activity;
  onClose: CallbackHandler;
}

function ConfirmParticipantActivationDialog({participantActivity, adminId, onClose}: ConfirmParticipantActivationDialogProps) {

  const {t} = useTranslation(["admin", "common"]);
  const dispatch = useDispatch();
  const {showSuccess} = useCustomSnackbar();

  const {originator, relatedEntityId: participantId} = participantActivity;

  async function handleActivateSubscriptionManual() {
    try {
      await dispatch(updateParticipantSubscription({adminId, participantId}));
      showSuccess(t("admin:participant_manual_activation_success", {participantEmail: originator}));
      onClose();
    } catch (e) {
      // TODO
    }
  }

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="Confirm Participant Activation">
      <DialogTitleCloseable onClose={onClose}>
        {t('confirmation_activate_subscription_title', {participantEmail: originator })}
      </DialogTitleCloseable>
      <DialogContent>
        <Span><Trans i18nKey="confirmation_activate_subscription_text"
                     ns="admin"
                     components={{ italic: <em /> }} />
        </Span>
      </DialogContent>
      <DialogActionsPanel onOk={handleActivateSubscriptionManual} onCancel={onClose} okLabel={"Ok"} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}