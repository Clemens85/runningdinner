import DoneIcon from '@mui/icons-material/Done';
import { Box, Button, Card, CardContent, Dialog, DialogContent, List, ListItem, ListItemSecondaryAction, ListItemText, Typography, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  assertDefined,
  BaseAdminIdProps,
  BaseRunningDinnerProps,
  CallbackHandler,
  findEntityById,
  findParticipantRegistrationsByAdminIdAsync,
  Fullname,
  HttpError,
  isArrayEmpty,
  isArrayNotEmpty,
  isDefined,
  isQuerySucceeded,
  isStringEmpty,
  isStringNotEmpty,
  LocalDate,
  Participant,
  ParticipantRegistrationInfo,
  ParticipantRegistrationInfoList,
  Time,
  updateParticipantSubscriptionByAdminIdAndIdAsync,
  useBackendIssueHandler,
  useDisclosure,
} from '@runningdinner/shared';
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { cloneDeep } from 'lodash-es';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../../common/FetchProgressBar';
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../common/theme/DialogTitleCloseable';
import LinkAction from '../../common/theme/LinkAction';
import LinkExtern from '../../common/theme/LinkExtern';
import { Span, Subtitle } from '../../common/theme/typography/Tags';
import { useAdminNavigation } from '../AdminNavigationHook';
import { MissingParticipantActivationDialog } from '../common/MissingParticipantActivationDialog';
import { useMissingParticipantActivation } from '../common/MissingParticipantActivationHook';

function filterNotActivatedRegistrationsTooOld(participantRegistrationDataPages: ParticipantRegistrationInfoList[]): ParticipantRegistrationInfo[] {
  return participantRegistrationDataPages.flatMap((p) => p.notActivatedRegistrationsTooOld).filter((notActivatedRegistration) => isDefined(notActivatedRegistration));
}

function exchangeParticipantInRegistrationsQueryData(updatedParticipant: Participant, existingRegistrationData: InfiniteData<ParticipantRegistrationInfoList, unknown>) {
  const updatedPages: ParticipantRegistrationInfoList[] = cloneDeep(existingRegistrationData.pages);
  for (let i = 0; i < updatedPages.length; i++) {
    const matchedRegistration = findEntityById(updatedPages[i].registrations, updatedParticipant.id);
    if (matchedRegistration) {
      transferActivationDateFromParticipant(updatedParticipant, matchedRegistration);
      const matchedNotActivatedRegistationTooOld = findEntityById(updatedPages[i].notActivatedRegistrationsTooOld, updatedParticipant.id);
      transferActivationDateFromParticipant(updatedParticipant, matchedNotActivatedRegistationTooOld);
      break;
    }
  }
  return {
    pages: updatedPages,
    pageParams: existingRegistrationData.pageParams,
  };
}

function transferActivationDateFromParticipant(src: Participant, registration?: ParticipantRegistrationInfo) {
  if (registration) {
    registration.activationDate = src.activationDate;
  }
}

export function ParticipantRegistrations({ runningDinner }: BaseRunningDinnerProps) {
  const { adminId } = runningDinner;

  const { t } = useTranslation(['admin', 'common']);

  const { isOpen, close, open, getIsOpenData } = useDisclosure<ParticipantRegistrationInfo>();

  const findParticipantRegistrationsByAdminIdQuery = useInfiniteQuery({
    queryFn: ({ pageParam }) => findParticipantRegistrationsByAdminIdAsync(adminId, pageParam),
    queryKey: ['findParticipantRegistrationsByAdminId', adminId],
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    refetchOnMount: 'always',
  });

  const { data: participantRegistrationData, hasNextPage, fetchNextPage, isFetchingNextPage } = findParticipantRegistrationsByAdminIdQuery;

  const { closeMissingParticipantActivationNotification, enableMissingParticipantAcivationNotification, showMissingParticipantActivationNotification } =
    useMissingParticipantActivation({ adminId });

  const participantRegistrationDataPages = participantRegistrationData?.pages || [];
  const registrations = participantRegistrationDataPages.flatMap((p) => p.registrations);
  const notActivatedRegistrationsTooOld = filterNotActivatedRegistrationsTooOld(participantRegistrationDataPages);

  useEffect(() => {
    // Use effect only for first fetched page!
    if (participantRegistrationDataPages.length !== 1) {
      return;
    }
    const notActivatedRegistrationsTooOldFirstPage = filterNotActivatedRegistrationsTooOld(participantRegistrationDataPages);
    enableMissingParticipantAcivationNotification(notActivatedRegistrationsTooOldFirstPage);
  }, [participantRegistrationDataPages]);

  if (!isQuerySucceeded(findParticipantRegistrationsByAdminIdQuery)) {
    return <FetchProgressBar {...findParticipantRegistrationsByAdminIdQuery} />;
  }
  assertDefined(participantRegistrationData);

  const hasNoRegistrations = isArrayEmpty(registrations);

  return (
    <>
      <Card>
        <CardContent>
          <Subtitle i18n={'admin:latest_registrations'} />
          {hasNoRegistrations && <NoRegistrations />}
          {isArrayNotEmpty(registrations) && (
            <List>
              {registrations.map((registration: ParticipantRegistrationInfo, index: number) => (
                <ParticipantRegistrationRow
                  key={index}
                  adminId={adminId}
                  participantRegistration={registration}
                  onShowConfirmSubscriptionActivationDialog={() => open(registration)}
                />
              ))}
            </List>
          )}
          {hasNextPage && (
            <Box pb={2}>
              {/* @ts-ignore */}
              <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant={'outlined'} fullWidth color={'primary'}>
                {t('common:show_more')}
              </Button>
            </Box>
          )}

          {isOpen && <ConfirmParticipantActivationDialog participantRegistration={getIsOpenData()} adminId={adminId} onClose={close} />}
        </CardContent>
      </Card>
      {showMissingParticipantActivationNotification && (
        <MissingParticipantActivationDialog
          open={showMissingParticipantActivationNotification}
          onClose={closeMissingParticipantActivationNotification}
          missingParticipantActivations={notActivatedRegistrationsTooOld}
        />
      )}
    </>
  );
}

interface ParticipantRegistrationRowProps extends BaseAdminIdProps {
  participantRegistration: ParticipantRegistrationInfo;
  onShowConfirmSubscriptionActivationDialog: CallbackHandler;
}
function ParticipantRegistrationRow({ participantRegistration, onShowConfirmSubscriptionActivationDialog, adminId }: ParticipantRegistrationRowProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { activationDate, createdAt, email, mobileNumber, firstnamePart, lastname, teamPartnerWishChildInfo, id } = participantRegistration;
  const { navigateToParticipant } = useAdminNavigation();

  const smUpDevice = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const participantActivated = !!activationDate;

  function renderTeamPartnerWishChildInfo() {
    if (isStringEmpty(teamPartnerWishChildInfo)) {
      return null;
    }
    return (
      <>
        <br />
        <Trans i18nKey="admin:team_partner_wish_registration_child_participant_child_info_1" values={{ fullname: teamPartnerWishChildInfo }} components={{ anchor: <span /> }} />
      </>
    );
  }

  function renderAdditionalContactDetails() {
    return (
      <>
        <br />
        <Fullname firstnamePart={firstnamePart} lastname={lastname} />
        {isStringNotEmpty(mobileNumber) && (
          <>
            <br />
            {t('common:mobile')}: <LinkExtern href={`tel:${mobileNumber}`} title={mobileNumber} />
          </>
        )}
        {renderTeamPartnerWishChildInfo()}
      </>
    );
  }

  function renderRegistrationDetails() {
    const dateToUse = activationDate ? activationDate : createdAt;
    return (
      <>
        <LocalDate date={dateToUse} /> {t('common:at_time')} <Time date={dateToUse} />
        {!participantActivated && (
          <>
            {renderAdditionalContactDetails()}
            <br />
            <Typography variant="caption">
              <i>{t('admin:registration_not_yet_confirmed')}</i>
            </Typography>
            {!smUpDevice && renderShowConfirmSubscriptionActivationDialogButton()}
          </>
        )}
        {participantActivated && <>{renderTeamPartnerWishChildInfo()}</>}
      </>
    );
  }

  function renderShowConfirmSubscriptionActivationDialogButton() {
    return (
      <LinkAction onClick={onShowConfirmSubscriptionActivationDialog} data-testid="activate-participant-action" color={'secondary'}>
        {t('admin:participant_subscription_activation_manual')}
      </LinkAction>
    );
  }

  function handleClick() {
    if (!participantActivated) {
      return;
    }
    navigateToParticipant(adminId, id!);
  }

  return (
    <ListItem divider={true} onClick={handleClick} sx={{ cursor: participantActivated ? 'pointer' : 'auto' }} data-testid="registration-row">
      <ListItemText primary={<Typography variant={'subtitle2'}>{email}</Typography>} secondary={renderRegistrationDetails()} />
      {!participantActivated ? (
        <ListItemSecondaryAction>{smUpDevice && renderShowConfirmSubscriptionActivationDialogButton()}</ListItemSecondaryAction>
      ) : (
        <DoneIcon color={'primary'} />
      )}
    </ListItem>
  );
}

function NoRegistrations() {
  return (
    <div>
      <Span i18n={'admin:no_registrations'} />
    </div>
  );
}

interface ConfirmParticipantActivationDialogProps extends BaseAdminIdProps {
  participantRegistration: ParticipantRegistrationInfo;
  onClose: CallbackHandler;
}

function ConfirmParticipantActivationDialog({ participantRegistration, adminId, onClose }: ConfirmParticipantActivationDialogProps) {
  const { t } = useTranslation(['admin', 'common']);

  // const dispatch = useAdminDispatch();
  const queryClient = useQueryClient();

  const { showSuccess } = useCustomSnackbar();
  const { getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common'],
    },
  });

  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const { email, id } = participantRegistration;

  async function handleActivateSubscriptionManual() {
    if (isStringEmpty(id) || id === undefined) {
      throw new Error('participantId must be set');
    }
    try {
      const updatedParticipant = await updateParticipantSubscriptionByAdminIdAndIdAsync(adminId, id);
      queryClient.setQueryData(['findParticipantRegistrationsByAdminId', adminId], (oldData: InfiniteData<ParticipantRegistrationInfoList, unknown>) => {
        return exchangeParticipantInRegistrationsQueryData(updatedParticipant, oldData);
      });

      // await dispatch(updateParticipantSubscription({adminId, participantId: id})).unwrap();
      showSuccess(t('admin:participant_manual_activation_success', { participantEmail: email }));
      onClose();
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="Confirm Participant Activation" data-testid="confirm-participant-activation-dialog">
      <DialogTitleCloseable onClose={onClose}>{t('confirmation_activate_subscription_title', { participantEmail: email })}</DialogTitleCloseable>
      <DialogContent>
        <Span>
          <Trans i18nKey="confirmation_activate_subscription_text" ns="admin" components={{ italic: <em /> }} />
        </Span>
      </DialogContent>
      <DialogActionsPanel onOk={handleActivateSubscriptionManual} onCancel={onClose} okLabel={'Ok'} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
