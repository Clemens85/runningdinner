import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Button, Card, Grid, Link, Stack, Typography } from '@mui/material';
import { BaseAdminIdProps, BaseRunningDinnerProps, CallbackHandler, isQuerySucceeded, isStringNotEmpty, MessageType, useFindTeams } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { DonateDialog, DonateDialogType } from '../../../common/donate/DonateButton';
import { FetchProgressBar } from '../../../common/FetchProgressBar';
import { BackToListButton, useMasterDetailView } from '../../../common/hooks/MasterDetailViewHook';
import { BrowserTitle } from '../../../common/mainnavigation/BrowserTitle';
import { useIsMobileDevice } from '../../../common/theme/CustomMediaQueryHook';
import { useCustomSnackbar } from '../../../common/theme/CustomSnackbarHook';
import Paragraph from '../../../common/theme/typography/Paragraph';
import { PageTitle, Span } from '../../../common/theme/typography/Tags';
import { SENT_FROM_MESSAGE_TYPE_QUERY_PARAM } from '../../AdminNavigationHook';
import { useDonatePopup } from '../../common/useDonatePopup';
import { MessageJobsOverview } from '../messagejobs/MessageJobsOverview';
import { CardRoundedClickable } from './CardRoundedClickable';
import { useMessageCardInfo } from './useMessageCardInfo';

type BaseMessagesCardProps = {
  currentMessageType: MessageType | undefined;
  hasTeams?: boolean;
} & BaseAdminIdProps;

type MessageCardListViewProps = {
  onCurrentMessageTypeChanged: (messageType: MessageType) => void;
} & BaseMessagesCardProps;

type MessagesCardProps = {
  selected?: boolean;
  onClick: CallbackHandler;
} & BaseMessagesCardProps;

export function MessagesLandingPage({ runningDinner }: BaseRunningDinnerProps) {
  const { adminId } = runningDinner;

  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess } = useCustomSnackbar();
  const { t } = useTranslation('admin');

  const { setDonatePopupOpenIfSuitable, showDonatePopup, closeDonatePopup } = useDonatePopup({ adminId });

  const [currentMessageType, setCurrentMessageType] = React.useState<MessageType>();

  const teamsQuery = useFindTeams(adminId);
  const teams = teamsQuery.data || [];

  const { showBackToListViewButton, setShowDetailsView, showListView, showDetailsView } = useMasterDetailView();

  const sentFromMessageType = searchParams.get(SENT_FROM_MESSAGE_TYPE_QUERY_PARAM);

  React.useEffect(() => {
    if (isStringNotEmpty(sentFromMessageType)) {
      showSuccess(t('admin:mails_sending_submitted'));

      const messageType = sentFromMessageType as MessageType;
      handleCurrentMessageTypeChanged(messageType);

      setDonatePopupOpenIfSuitable(messageType);

      searchParams.delete(SENT_FROM_MESSAGE_TYPE_QUERY_PARAM);
      setSearchParams(searchParams);
    }
  }, [sentFromMessageType, setCurrentMessageType]);

  const handleCurrentMessageTypeChanged = (messageType: MessageType) => {
    setCurrentMessageType(messageType);
    setShowDetailsView(true);
  };

  const handleBackToListView = () => {
    setCurrentMessageType(undefined);
    setShowDetailsView(false);
  };

  if (!isQuerySucceeded(teamsQuery)) {
    return <FetchProgressBar {...teamsQuery} />;
  }

  const hasTeams = teams.length > 0;

  return (
    <>
      <BrowserTitle titleI18nKey={'messages_landing_messaging'} namespaces={'admin'} />
      <Grid container>
        <Grid size={12}>
          <PageTitle>{t('admin:messages_landing_messaging')}</PageTitle>
        </Grid>
      </Grid>
      {showBackToListViewButton && <BackToListButton onBackToList={handleBackToListView} />}

      {showListView && (
        <Grid container sx={{ mb: 2 }}>
          <Grid size={12}>
            <Paragraph>
              {t('admin:messages_landing_start_1')}
              <br />
              {t('admin:messages_landing_start_2')}
            </Paragraph>
          </Grid>
        </Grid>
      )}

      <Grid container size={12} spacing={2}>
        <Grid size={{ xs: 12, md: 6 }} data-testid="messages-card-list-wrapper">
          {showListView && (
            <MessageCardListView currentMessageType={currentMessageType} hasTeams={hasTeams} onCurrentMessageTypeChanged={handleCurrentMessageTypeChanged} adminId={adminId} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} data-testid="messages-content-wrapper">
          {showDetailsView && <MessagesCardContent currentMessageType={currentMessageType} adminId={adminId} hasTeams={hasTeams} />}
        </Grid>
      </Grid>
      {showDonatePopup && (
        <DonateDialog
          onClose={(remindMe) => closeDonatePopup(currentMessageType, remindMe)}
          donateDialogType={currentMessageType === MessageType.MESSAGE_TYPE_DINNERROUTE ? DonateDialogType.DINNER_ROUTE_MESSAGES : DonateDialogType.TEAM_MESSAGES}
        />
      )}
    </>
  );
}

function MessageCardListView({ currentMessageType, hasTeams, onCurrentMessageTypeChanged, adminId }: MessageCardListViewProps) {
  return (
    <>
      <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={2} useFlexGap sx={{ width: '100%', display: 'flex' }}>
        <MessagesCard
          onClick={() => onCurrentMessageTypeChanged(MessageType.MESSAGE_TYPE_PARTICIPANTS)}
          currentMessageType={MessageType.MESSAGE_TYPE_PARTICIPANTS}
          adminId={adminId}
          selected={currentMessageType === MessageType.MESSAGE_TYPE_PARTICIPANTS}
        />

        <MessagesCard
          onClick={() => onCurrentMessageTypeChanged(MessageType.MESSAGE_TYPE_TEAMS)}
          currentMessageType={MessageType.MESSAGE_TYPE_TEAMS}
          adminId={adminId}
          hasTeams={hasTeams}
          selected={currentMessageType === MessageType.MESSAGE_TYPE_TEAMS}
        />

        <MessagesCard
          onClick={() => onCurrentMessageTypeChanged(MessageType.MESSAGE_TYPE_DINNERROUTE)}
          currentMessageType={MessageType.MESSAGE_TYPE_DINNERROUTE}
          adminId={adminId}
          hasTeams={hasTeams}
          selected={currentMessageType === MessageType.MESSAGE_TYPE_DINNERROUTE}
        />
      </Stack>
    </>
  );
}

function MessagesCardContent({ currentMessageType, hasTeams, adminId }: BaseMessagesCardProps) {
  const messageCardInfo = useMessageCardInfo(currentMessageType, adminId, hasTeams);
  const isMobileDevice = useIsMobileDevice();

  if (!messageCardInfo || !currentMessageType) {
    return <NoMessageTypeSelected />;
  }

  const { routerPath, routerPathTitle, routeEnabled } = messageCardInfo;

  return (
    <Card sx={{ p: 3, height: isMobileDevice ? '100%' : '50vh' }}>
      <Box sx={{ mb: 3 }}>
        <Button color={'primary'} variant={'outlined'} size="large" fullWidth to={routerPath} component={RouterLink} disabled={!routeEnabled}>
          {routerPathTitle}
        </Button>
        {routeEnabled === false && (
          <Box mt={2}>
            <Span i18n="admin:messages_landing_team_arrangements_needed_hint"></Span>
          </Box>
        )}
      </Box>
      <MessageJobsOverview adminId={adminId} messageType={currentMessageType} />
    </Card>
  );
}

function MessagesCard({ currentMessageType, selected, hasTeams, adminId, onClick }: MessagesCardProps) {
  const isMobileDevice = useIsMobileDevice();

  const messageCardInfo = useMessageCardInfo(currentMessageType, adminId, hasTeams);
  if (!messageCardInfo) {
    return null;
  }

  const { icon, title, description } = messageCardInfo;

  return (
    <CardRoundedClickable
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 3,
        mb: 2,
        height: 'fit-content',
        width: '100%',
        background: 'none',
        backgroundColor: selected ? 'action.selected' : undefined,
        borderColor: selected ? 'primary.light' : 'grey.300',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          textAlign: 'left',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          gap: 2.5,
        }}
      >
        {!isMobileDevice && <Box sx={{ color: selected ? 'primary.main' : 'grey.200' }}>{icon}</Box>}

        <Box>
          <Typography color="text.primary" variant="h5">
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body1" sx={{ my: 0.5 }}>
            {description}
          </Typography>

          <Link
            color="primary"
            variant="body1"
            onClick={onClick}
            fontWeight="bold"
            sx={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              '& > svg': { transition: '0.2s' },
              '&:hover > svg': { transform: 'translateX(2px)' },
            }}
          >
            <span>{title}</span>
            <ChevronRightRoundedIcon fontSize="small" sx={{ mt: '1px', ml: '2px' }} />
          </Link>
        </Box>
      </Box>
    </CardRoundedClickable>
  );
}

function NoMessageTypeSelected() {
  const { t } = useTranslation('admin');

  return (
    <Card sx={{ p: 3, height: '50vh' }}>
      <Grid container justifyContent={'center'} alignItems={'baseline'}>
        <Grid>
          <Typography variant="subtitle1" sx={{ px: 2, verticalAlign: 'center' }}>
            {t('admin:messages_landing_no_selection_hint')}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
