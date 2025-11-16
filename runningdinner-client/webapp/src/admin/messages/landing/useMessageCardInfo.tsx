import { MessageType } from '@runningdinner/shared';
import MailIcon from '@mui/icons-material/Mail';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslation } from 'react-i18next';

import { useAdminNavigation } from '../../AdminNavigationHook';

export type MessageCardInfo = {
  title: string;
  description: string;
  icon: React.ReactNode;
  routerPath: string;
  routerPathTitle: string;
  routeEnabled: boolean;
};

export function useMessageCardInfo(messageType: MessageType | undefined, adminId: string, hasTeams?: boolean): MessageCardInfo | undefined {
  const { t } = useTranslation(['admin', 'common']);
  const { generateParticipantMessagesPath, generateTeamMessagesPath, generateDinnerRouteMessagesPath } = useAdminNavigation();

  if (!messageType) {
    return undefined;
  }

  if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
    return {
      title: t('admin:mails_participant_sendmessage_headline'),
      description: t('admin:messages_landing_participants_description'),
      icon: <MailIcon />,
      routerPath: generateParticipantMessagesPath(adminId),
      routerPathTitle: t('messages_send_participants'),
      routeEnabled: true,
    };
  } else if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
    return {
      title: t('admin:mails_team_sendmessage_headline'),
      description: t('admin:messages_landing_teams_description'),
      icon: <GroupIcon />,
      routerPath: generateTeamMessagesPath(adminId),
      routerPathTitle: t('messages_send_teams'),
      routeEnabled: !!hasTeams,
    };
  } else if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
    return {
      title: t('admin:mails_senddinnerroute_sendmessage'),
      description: t('admin:messages_landing_dinnerroutes_description'),
      icon: <GroupIcon />,
      routerPath: generateDinnerRouteMessagesPath(adminId),
      routerPathTitle: t('messages_send_dinnerroutes'),
      routeEnabled: !!hasTeams,
    };
  } else {
    throw new Error(`Unknown message type: ${messageType}`);
  }
}
