import React from 'react';
import {SpacingGrid} from "../theme/SpacingGrid";
import SecondaryButton from "../theme/SecondaryButton";
import {useTranslation} from "react-i18next";
import {SpacingProps} from "@material-ui/system";

type AfterPartyLocationToggleButtonProps = {
  afterPartyLocationEnabled: boolean;
  onToggleAfterPartyLocation: (enable: boolean) => unknown;
}

export function AfterPartyLocationToggleButton(props: AfterPartyLocationToggleButtonProps & SpacingProps) {

  const {t} = useTranslation(['common']);

  const {afterPartyLocationEnabled, onToggleAfterPartyLocation, ...spacingProps} = props;

  return (
    <SpacingGrid container justify={"flex-start"} {...spacingProps}>
      <SpacingGrid item>
        { !afterPartyLocationEnabled &&
          <SecondaryButton color={"primary"} variant={"outlined"} onClick={() => onToggleAfterPartyLocation(true)}>
            {t("common:after_party_location_add")}
          </SecondaryButton> }
        { afterPartyLocationEnabled &&
          <SecondaryButton color={"secondary"} variant={"outlined"} onClick={() => onToggleAfterPartyLocation(false)}>
            {t("common:after_party_location_remove")}
          </SecondaryButton> }
      </SpacingGrid>
    </SpacingGrid>
  );
}
