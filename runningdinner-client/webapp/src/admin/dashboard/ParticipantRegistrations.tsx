import {useEffect} from 'react';
import {
  BaseAdminIdProps,
  BaseRunningDinnerProps, CallbackHandler,
  fetchNextParticipantRegistrations,
  Fullname,
  getFullname,
  getParticipantRegistrationsFetchSelector,
  HttpError,
  isArrayNotEmpty,
  isParticipantRegistrationsEmpty, isStringEmpty, isStringNotEmpty, LocalDate, ParticipantRegistrationInfo, Time, updateParticipantSubscription,
  useAdminDispatch,
  useAdminSelector, useBackendIssueHandler, useDisclosure
} from "@runningdinner/shared";
import {
  Box,
  Button, Card, CardContent,
  Dialog, DialogContent,
  LinearProgress,
  List, ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography, useMediaQuery
} from "@mui/material";
import {Span, Subtitle} from "../../common/theme/typography/Tags";
import {useDispatch} from "react-redux";
import {FetchStatus} from "@runningdinner/shared";
import {Trans, useTranslation} from "react-i18next";
import LinkAction from "../../common/theme/LinkAction";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import DoneIcon from "@mui/icons-material/Done";
import {useAdminNavigation} from "../AdminNavigationHook";
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import {Theme} from "@mui/material/styles";
import LinkExtern from '../../common/theme/LinkExtern';
import { MissingParticipantActivationDialog } from '../common/MissingParticipantActivationDialog';
import { useMissingParticipantActivation } from '../common/MissingParticipantActivationHook';

export function ParticipantRegistrations({runningDinner}: BaseRunningDinnerProps) {

  const dispatch = useDispatch();
  const {adminId} = runningDinner;

  const {data: participantRegistrationInfoList, fetchStatus} = useAdminSelector(getParticipantRegistrationsFetchSelector);
  const hasNoRegistrations = useAdminSelector(isParticipantRegistrationsEmpty);
  const {t} = useTranslation(["admin", "common"]);

  const {isOpen, close, open, getIsOpenData} = useDisclosure<ParticipantRegistrationInfo>();

  const { closeMissingParticipantActivationNotification, 
          enableMissingParticipantAcivationNotification,
          showMissingParticipantActivationNotification } = useMissingParticipantActivation({ adminId });

  const showMoreLink = participantRegistrationInfoList?.hasMore;

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchNextParticipantRegistrations({adminId, initialFetch: true}));
  }, [adminId, dispatch]);

  useEffect(() => {
    if (fetchStatus === FetchStatus.SUCCEEDED) {
      enableMissingParticipantAcivationNotification(participantRegistrationInfoList?.notActivatedRegistrationsTooOld);
    }
  }, [fetchStatus])

  return (
    <>
      <Card>
        <CardContent>
          <Subtitle i18n={"admin:latest_registrations"} />
          { fetchStatus === FetchStatus.LOADING && <LinearProgress variant={"indeterminate"} /> }
          { hasNoRegistrations && <NoRegistrations /> }
          { isArrayNotEmpty(participantRegistrationInfoList?.registrations) &&
            <List>
              { participantRegistrationInfoList!.registrations.map((registration: ParticipantRegistrationInfo, index: number) => <ParticipantRegistrationRow key={index}
                                                                                                                                                             adminId={adminId}
                                                                                                                                                             participantRegistration={registration}
                                                                                                                                                             onShowConfirmSubscriptionActivationDialog={() => open(registration)} />) }
            </List>
          }
          { showMoreLink &&
            <Box pb={2}>
              {/* @ts-ignore */}
              <Button onClick={() => dispatch(fetchNextParticipantRegistrations({adminId}))}
                      variant={"outlined"}
                      fullWidth
                      color={"primary"}>{t("common:show_more")}</Button>
            </Box>
           }

          { isOpen && <ConfirmParticipantActivationDialog participantRegistration={getIsOpenData()}
                                                          adminId={adminId}
                                                          onClose={close} /> }
        </CardContent>
      </Card>
      { showMissingParticipantActivationNotification && <MissingParticipantActivationDialog open={showMissingParticipantActivationNotification} 
                                                                                            onClose={closeMissingParticipantActivationNotification} 
                                                                                            missingParticipantActivations={participantRegistrationInfoList.notActivatedRegistrationsTooOld} /> 
      }
    </>
  );
}

interface ParticipantRegistrationRowProps extends BaseAdminIdProps {
  participantRegistration: ParticipantRegistrationInfo;
  onShowConfirmSubscriptionActivationDialog: CallbackHandler;
}
function ParticipantRegistrationRow({participantRegistration, onShowConfirmSubscriptionActivationDialog, adminId}: ParticipantRegistrationRowProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {activationDate, createdAt, email, mobileNumber, firstnamePart, lastname, teamPartnerWishChildInfo, id} = participantRegistration;
  const {navigateToParticipant} = useAdminNavigation();

  const smUpDevice = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const participantActivated = !!activationDate;

  function renderTeamPartnerWishChildInfo() {
    if (isStringEmpty(teamPartnerWishChildInfo)) {
      return null;
    }
    return (
      <>
        <br/>
        <Trans i18nKey="admin:team_partner_wish_registration_child_participant_child_info_1" 
               values={{ fullname: teamPartnerWishChildInfo }}
               components={{ anchor: <span /> }}
               />
      </> 
    );
  }

  function renderAdditionalContactDetails() {
    return (
      <>
        <br/><Fullname firstnamePart={firstnamePart} lastname={lastname}/>
        { isStringNotEmpty(mobileNumber) && <><br/>{t("common:mobile")}: <LinkExtern href={`tel:${mobileNumber}`} title={mobileNumber} /></> }
        { renderTeamPartnerWishChildInfo() }
      </>
    );
  }

  function renderRegistrationDetails() {
    const dateToUse = activationDate ? activationDate : createdAt;
    return (
      <>
        <LocalDate date={dateToUse} /> {t("common:at_time")} <Time date={dateToUse} />
        { !participantActivated &&
          <>
            { renderAdditionalContactDetails() }
            <br/>
            <Typography variant="caption"><i>{t("admin:registration_not_yet_confirmed")}</i></Typography>
            { !smUpDevice && renderShowConfirmSubscriptionActivationDialogButton() }
          </> }
        { participantActivated && <>{renderTeamPartnerWishChildInfo()}</> }
      </>
    );
  }

  function renderShowConfirmSubscriptionActivationDialogButton() {
    return <LinkAction onClick={onShowConfirmSubscriptionActivationDialog} color={"secondary"}>{t("admin:participant_subscription_activation_manual")}</LinkAction>;
  }

  function handleClick() {
    if (!participantActivated) {
      return;
    }
    navigateToParticipant(adminId, id!);
  }

  return (
    <ListItem divider={true} onClick={handleClick} sx={{ cursor: participantActivated ? 'pointer' : "auto" }}>
      <ListItemText primary={<Typography variant={"subtitle2"}>{email}</Typography>}
                    secondary={renderRegistrationDetails()} />
      { !participantActivated ?
        <ListItemSecondaryAction>
          { smUpDevice && renderShowConfirmSubscriptionActivationDialogButton() }
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
  participantRegistration: ParticipantRegistrationInfo;
  onClose: CallbackHandler;
}

function ConfirmParticipantActivationDialog({participantRegistration, adminId, onClose}: ConfirmParticipantActivationDialogProps) {

  const {t} = useTranslation(["admin", "common"]);
  const dispatch = useAdminDispatch();
  const {showSuccess} = useCustomSnackbar();
  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ["admin", "common"]
    }
  });

  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const {email, id} = participantRegistration;

  async function handleActivateSubscriptionManual() {

    if (isStringEmpty(id) || id === undefined) {
      throw new Error("participantId must be set");
    }
    try {
      await dispatch(updateParticipantSubscription({adminId, participantId: id})).unwrap();
      showSuccess(t("admin:participant_manual_activation_success", {participantEmail: email}));
      onClose();
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="Confirm Participant Activation">
      <DialogTitleCloseable onClose={onClose}>
        {t('confirmation_activate_subscription_title', {participantEmail: email })}
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