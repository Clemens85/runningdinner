import { MessageType } from "@runningdinner/shared";
import MailIcon from '@mui/icons-material/Mail';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslation } from "react-i18next";

import { useAdminNavigation } from "../../AdminNavigationHook";

export type MessageCardInfo = {
  title: string;
  description: string;
  icon: React.ReactNode;
  routerPath: string;
  routerPathTitle: string;
  routeEnabled: boolean;
};

export function useMessageCardInfo(messageType: MessageType | undefined, adminId: string, hasTeams?: boolean): MessageCardInfo | undefined {
  
  const {t} = useTranslation(['admin', 'common']);
  const {generateParticipantMessagesPath, generateTeamMessagesPath, generateDinnerRouteMessagesPath} = useAdminNavigation();

  if (!messageType) {
    return undefined;
  }

  if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
    return {
      title: t('admin:mails_participant_sendmessage_headline'),
      description: "Willst du (Vorab-)Informationen an alle oder einzelne Teilnehmer schicken? Dann bist du hier richtig.",
      icon: <MailIcon />,
      routerPath: generateParticipantMessagesPath(adminId),
      routerPathTitle: t('messages_send_participants'),
      routeEnabled: true
    };
  } else if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
    return {
      title: t('admin:mails_team_sendmessage_headline'),
      description: "Hier kannst du Nachrichten über die Team-Einteilnugen an die Teams verschicken (wer kocht mit wem welche Speise). " +
                   "Aber du kannst auch sonstige Nachrichten an (Einzel-)Teams schicken.",
      icon: <GroupIcon />,
      routerPath: generateTeamMessagesPath(adminId),
      routerPathTitle: t('messages_send_teams'),
      routeEnabled: !!hasTeams
    };
  } else if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
    return {
      title: t('admin:mails_senddinnerroute_sendmessage'),
      description: "Willst du die Laufwege an alle Teams schicken? Dann bist du hier richtig.",
      icon: <GroupIcon />,
      routerPath: generateDinnerRouteMessagesPath(adminId),
      routerPathTitle: t('messages_send_dinnerroutes'),
      routeEnabled: !!hasTeams
    };
  } else {
    throw new Error(`Unknown message type: ${messageType}`);
  }
}
