import React from 'react';
import {Alert} from "@material-ui/lab";
import {useWizardSelector} from "./WizardStore";
import {isDemoDinnerSelector} from "./WizardSlice";
import {Trans} from "react-i18next";
import useCommonStyles from "../common/theme/CommonStyles";
import clsx from "clsx";

export default function WizardMenuNotificationBar() {

  const isDemoDinner = useWizardSelector(isDemoDinnerSelector);

  const styles = useCommonStyles();

  if (!isDemoDinner) {
    return null;
  }
  return (
      <Alert severity={"info"} icon={false} >
        <div className={clsx(styles.textAlignCenter, styles.fullWidth)}>
          <Trans i18nKey={'wizard_demo_mode_text'} ns={"wizard"}/>
        </div>
      </Alert>
  );
}
