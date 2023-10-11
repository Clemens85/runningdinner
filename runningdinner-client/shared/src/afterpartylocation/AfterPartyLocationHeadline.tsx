import {useTranslation} from "react-i18next";
import { Time } from '../date';
import { AfterPartyLocation } from '../types';

export function AfterPartyLocationHeadline({time}: AfterPartyLocation) {
  const {t} = useTranslation(["common"]);
  return (
    <>{t("common:after_event_party")} {t('common:at_time')} <Time date={time}/></>
  );
}