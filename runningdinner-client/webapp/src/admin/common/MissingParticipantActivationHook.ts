import { BaseAdminIdProps, ParticipantRegistrationInfo, isArrayNotEmpty } from "@runningdinner/shared";
import { useState } from "react";
import { getLocalStorageInAdminId, setLocalStorageInAdminId } from "../../common/LocalStorageService";

function isNotificationAllowed(adminId: string): boolean {
  const showMissingParticipantActionNotification = getLocalStorageInAdminId<boolean>("showMissingParticipantActionNotification", adminId);
  return showMissingParticipantActionNotification !== false;
}

function disableNotification(adminId: string) {
  setLocalStorageInAdminId("showMissingParticipantActionNotification", false, adminId);
}

export function useMissingParticipantActivation({adminId}: BaseAdminIdProps) {
  
  const [missingParticipantActivationNotificationEnabled, setMissingParticipantActivationNotificationEnabled] = useState<boolean>(false);
  const [notificationWasShown, setNotificationWasShown] = useState<boolean>(false);

  const closeMissingParticipantActivationNotification = (disallowNotification?: boolean) => {
    if (disallowNotification) {
      disableNotification(adminId);
    }
    setMissingParticipantActivationNotificationEnabled(false);
    setNotificationWasShown(true);
  };

  const enableMissingParticipantAcivationNotification = (missingParticipantActivations: ParticipantRegistrationInfo[]) => {
    setMissingParticipantActivationNotificationEnabled(isArrayNotEmpty(missingParticipantActivations) && isNotificationAllowed(adminId));
  };

  return {
    showMissingParticipantActivationNotification: !notificationWasShown && missingParticipantActivationNotificationEnabled,
    enableMissingParticipantAcivationNotification,
    closeMissingParticipantActivationNotification
  }
}