import React from 'react';
import {AfterPartyLocation, Time} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";

export default function AfterPartyLocationHeadline({time}: AfterPartyLocation) {
  const {t} = useTranslation(["common"]);
  return (
    <>{t("common:after_event_party")} {t('common:at_time')} <Time date={time}/></>
  );
}