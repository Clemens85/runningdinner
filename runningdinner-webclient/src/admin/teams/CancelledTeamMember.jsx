import React from "react";
import {useTranslation} from "react-i18next";
import useTeamStyles from "common/theme/TeamStyles";

export function CancelledTeamMember() {

  const {t} = useTranslation(['common', 'admin']);
  const teamClasses = useTeamStyles();

  return (
      <span className={teamClasses.cancelledText}>{(t('admin:cancelled'))}</span>
  );

}
