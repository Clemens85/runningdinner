import { formatLocalDateWithSeconds, getMinutesBetweenDates, isAfterInDays, parseLocalDateWithSeconds, useDisclosure } from '@runningdinner/shared';
import { cloneDeep } from 'lodash-es';

import { isLocalDevEnv } from '../EnvService';
import { getLocalStorageItem, setLocalStorageItem } from '../LocalStorageService';

type TeaserPopupStatus = {
  remindMe: boolean;
  lastShowDate: Date | undefined;
  lastShowDateRaw?: string | undefined;
};

type TeaserPopupProps = {
  popupKey: string;
  showUntil: Date;
};
export function useTeaserPopup({ popupKey, showUntil }: TeaserPopupProps) {
  const { open, isOpen, close } = useDisclosure();

  const setPopupOpenDelayed = (delay: number) => {
    window.setTimeout(() => {
      open();
    }, delay);
  };

  const setTeaserPopupOpenIfSuitable = () => {
    let teaserPopupStatus = getLocalStorageItem<TeaserPopupStatus>(buildStorageKey(popupKey));
    teaserPopupStatus = mapTeaserPopupStatus(teaserPopupStatus);

    if (shouldShowTeaserPopup(teaserPopupStatus, showUntil)) {
      setPopupOpenDelayed(800);
      persistTeaserPopupStatus({
        remindMe: false,
        lastShowDate: new Date(),
      });
    }
  };

  const closeTeaserPopup = (remindMe: boolean) => {
    close();
    persistTeaserPopupStatus({
      remindMe,
      lastShowDate: new Date(),
    });
  };

  function persistTeaserPopupStatus(incomingTeaserPopupStatus: TeaserPopupStatus) {
    const teaserPopupStatus = cloneDeep(incomingTeaserPopupStatus);
    teaserPopupStatus.lastShowDateRaw = formatLocalDateWithSeconds(incomingTeaserPopupStatus.lastShowDate);
    setLocalStorageItem(buildStorageKey(popupKey), teaserPopupStatus);
    sessionStorage.setItem(buildStorageKey(popupKey), 'true');
  }

  function shouldShowTeaserPopup(teaserPopupStatus: TeaserPopupStatus | undefined, showUntil: Date): boolean {
    const isValid = !isAfterInDays(new Date(), showUntil);
    if (!teaserPopupStatus && isValid) {
      return true;
    }

    const shownInCurrentSession = sessionStorage.getItem(buildStorageKey(popupKey));
    if (shownInCurrentSession || !teaserPopupStatus?.remindMe) {
      return false;
    }

    if (!isValid || !teaserPopupStatus.remindMe) {
      return false;
    }

    const MIN_MINUTES_BETWEEN_SHOWS = isLocalDevEnv() ? 1 : 4;
    const lastShownBeforeMinutes = getMinutesBetweenDates(new Date(), teaserPopupStatus.lastShowDate || new Date());
    if (lastShownBeforeMinutes < MIN_MINUTES_BETWEEN_SHOWS) {
      return false;
    }
    return true;
  }

  function mapTeaserPopupStatus(teaserPopupStatus?: TeaserPopupStatus): TeaserPopupStatus | undefined {
    if (!teaserPopupStatus) {
      return undefined;
    }
    const result = cloneDeep(teaserPopupStatus);
    result.lastShowDate = parseLocalDateWithSeconds(teaserPopupStatus.lastShowDateRaw);
    return result;
  }

  function buildStorageKey(popupKey: string) {
    const devMarker = isLocalDevEnv() ? 'dev_' : '';
    return `teaserPopupStatus_${devMarker}${popupKey}`;
  }

  return {
    setTeaserPopupOpenIfSuitable,
    closeTeaserPopup,
    showTeaserPopup: isOpen,
  };
}
