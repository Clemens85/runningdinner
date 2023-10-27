import { BaseAdminIdProps, ParticipantRegistrationInfo, isArrayNotEmpty } from "@runningdinner/shared";
import { useState } from "react";
import { getLocalStorageInAdminId, setLocalStorageInAdminId } from "../../common/LocalStorageService";

type MissingParticipantActivationProps = {
  // missingParticipantActivations?: ParticipantRegistrationInfo[]
} & BaseAdminIdProps;

function isNotificationAllowed(adminId: string): boolean {
  const showMissingParticipantActionNotification = getLocalStorageInAdminId<boolean>("showMissingParticipantActionNotification", adminId);
  return showMissingParticipantActionNotification !== false;
}

function disableNotification(adminId: string) {
  setLocalStorageInAdminId("showMissingParticipantActionNotification", false, adminId);
}

export function useMissingParticipantActivation({adminId}: MissingParticipantActivationProps) {
  
  const [showMissingParticipantActivationNotification, setShowMissingParticipantActivationNotification] = useState<boolean>(false);

  const closeMissingParticipantActivationNotification = (disallowNotification?: boolean) => {
    if (disallowNotification) {
      disableNotification(adminId);
    }
    setShowMissingParticipantActivationNotification(false);
  };

  // const missingParticipantActivationsMemo = useMemo(() => missingParticipantActivations, []);

  const enableMissingParticipantAcivationNotification = (missingParticipantActivations: ParticipantRegistrationInfo[]) => {
    setShowMissingParticipantActivationNotification(isArrayNotEmpty(missingParticipantActivations) && isNotificationAllowed(adminId));
  };

  // useEffect(() => {
  //   setShowMissingParticipantActivationNotification(isArrayNotEmpty(missingParticipantActivations) && isNotificationAllowed(adminId));
  // }, [adminId])

  return {
    showMissingParticipantActivationNotification,
    enableMissingParticipantAcivationNotification,
    closeMissingParticipantActivationNotification
  }
}