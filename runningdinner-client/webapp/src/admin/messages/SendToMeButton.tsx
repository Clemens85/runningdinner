import { Box,Grid } from '@mui/material';
import {
  BaseAdminIdProps,
  BaseMessage,
  getMailMessageForSelectedRecipient,
  HttpError,
  MessageType,
  Recipient,
  sendMessagesAsync,
  useBackendIssueHandler,
} from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { useUrlQuery } from '../../common/hooks/useUrlQuery';
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import { SecondaryButtonAsync } from '../../common/theme/SecondaryButtonAsync';

type SendToMeButtonProps = {
  messageType: MessageType;
  selectedRecipient: Recipient;
  messageObj: BaseMessage;
} & BaseAdminIdProps;

const MAIL_PROVIDER_TO_USE_QUERY_PARAM = 'mailProviderToUse';

export default function SendToMeButton({ adminId, messageObj, messageType, selectedRecipient }: SendToMeButtonProps) {
  const { showSuccess } = useCustomSnackbar();
  const { t } = useTranslation('admin');
  const query = useUrlQuery();

  const { getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  async function handleSendToMe() {
    const message = getMailMessageForSelectedRecipient(messageObj, messageType, selectedRecipient);
    const mailProviderToUse = query.get(MAIL_PROVIDER_TO_USE_QUERY_PARAM);
    try {
      await sendMessagesAsync(adminId, message, messageType, true, mailProviderToUse);
      showSuccess(t('mails_send_to_dinner_owner'));
    } catch (error) {
      showHttpErrorDefaultNotification(error as HttpError);
    }
  }

  return (
    <Grid container justifyContent={'flex-end'}>
      <Grid item>
        <Box mt={1}>
          <SecondaryButtonAsync onClick={handleSendToMe} color="primary">
            {t('message_send_to_me')}
          </SecondaryButtonAsync>
        </Box>
      </Grid>
    </Grid>
  );
}
