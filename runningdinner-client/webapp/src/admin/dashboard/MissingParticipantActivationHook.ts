import { BaseAdminIdProps, ParticipantRegistrationInfo, isArrayNotEmpty } from "@runningdinner/shared";
import { getLocalStorageInAdminId, setLocalStorageInAdminId } from "../../common/LocalStorageService";
import { useEffect, useState } from "react";

type MissingParticipantActivationProps = {
  missingParticipantActivations?: ParticipantRegistrationInfo[]
} & BaseAdminIdProps;

function isNotificationAllowed(adminId: string): boolean {
  const showMissingParticipantActionNotification = getLocalStorageInAdminId<boolean>("showMissingParticipantActionNotification", adminId);
  return showMissingParticipantActionNotification !== false;
}

function disableNotification(adminId: string) {
  setLocalStorageInAdminId("showMissingParticipantActionNotification", false, adminId);
}

export function useMissingParticipantActivation({adminId, missingParticipantActivations}: MissingParticipantActivationProps) {
  
  const [showMissingParticipantActivationNotification, setShowMissingParticipantActivationNotification] = useState<boolean>(false);

  const closeMissingParticipantActivationNotification = (disallowNotification?: boolean) => {
    if (disallowNotification) {
      disableNotification(adminId);
    }
    setShowMissingParticipantActivationNotification(false);
  };

  useEffect(() => {
    setShowMissingParticipantActivationNotification(isArrayNotEmpty(missingParticipantActivations) && isNotificationAllowed(adminId));
  }, [adminId, missingParticipantActivations])

  return {
    showMissingParticipantActivationNotification,
    closeMissingParticipantActivationNotification
  }
}