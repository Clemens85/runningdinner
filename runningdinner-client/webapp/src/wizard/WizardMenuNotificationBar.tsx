import React from 'react';
import {useWizardSelector} from "@runningdinner/shared";
import {isDemoDinnerSelector} from "@runningdinner/shared";
import {Trans} from "react-i18next";
import AlertCentered from "../common/theme/AlertCentered";

export default function WizardMenuNotificationBar() {

  const isDemoDinner = useWizardSelector(isDemoDinnerSelector);

  if (!isDemoDinner) {
    return null;
  }
  return (
      <AlertCentered severity={"info"} icon={false}>
        <Trans i18nKey={'wizard_demo_mode_text'} ns={"wizard"}/>
      </AlertCentered>
  );
}
