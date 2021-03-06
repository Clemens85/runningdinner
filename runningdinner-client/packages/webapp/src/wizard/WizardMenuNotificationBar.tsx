import React from 'react';
import {Alert} from "@material-ui/lab";
import {useWizardSelector} from "./WizardStore";
import {isDemoDinnerSelector} from "./WizardSlice";
import {Trans} from "react-i18next";

export default function WizardMenuNotificationBar() {

  const isDemoDinner = useWizardSelector(isDemoDinnerSelector);

  if (!isDemoDinner) {
    return null;
  }
  return (
      <Alert severity={"info"} icon={false}>
        <Trans i18nKey={'wizard_demo_mode_text'} ns={"wizard"}/>
      </Alert>
  );
}
