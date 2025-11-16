import { BaseAdminIdProps, MessageType, useDisclosure } from '@runningdinner/shared';

import { getLocalStorageInAdminId, setLocalStorageInAdminId } from '../../common/LocalStorageService';

type DonateStatus = {
  teamMessagesShown: boolean;
  dinnerRouteMessagesShown: boolean;
  remindMe: boolean;
};

export function useDonatePopup({ adminId }: BaseAdminIdProps) {
  const { open, isOpen, close } = useDisclosure();

  const setDonatePopupOpenDelayed = (delay: number) => {
    window.setTimeout(() => {
      open();
    }, delay);
  };

  const setDonatePopupOpenIfSuitable = (messageType: MessageType, delay: number = 2500) => {
    const donateStatus = getLocalStorageInAdminId<DonateStatus>('donateStatus', adminId);
    if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
      if (donateStatus?.teamMessagesShown) {
        return;
      } else {
        setDonatePopupOpenDelayed(delay);
      }
    } else if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE && donateStatus?.teamMessagesShown && donateStatus?.remindMe && !donateStatus?.dinnerRouteMessagesShown) {
      setDonatePopupOpenDelayed(delay);
    }
  };

  const closeDonatePopup = (messageType: MessageType | undefined, remindMe: boolean) => {
    setLocalStorageInAdminId(
      'donateStatus',
      {
        teamMessagesShown: true, // Due to this is our first touch-point, we always mark it as true
        dinnerRouteMessagesShown: messageType === MessageType.MESSAGE_TYPE_DINNERROUTE,
        remindMe: !!remindMe,
      },
      adminId,
    );
    close();
  };

  return {
    setDonatePopupOpenIfSuitable,
    showDonatePopup: isOpen,
    closeDonatePopup,
  };
}
