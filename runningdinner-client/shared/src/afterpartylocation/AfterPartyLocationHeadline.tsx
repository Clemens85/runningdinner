import { useTranslation } from 'react-i18next';

import { Time } from '../date';
import { AfterPartyLocation } from '../types';

export function AfterPartyLocationHeadline({ time, title }: AfterPartyLocation) {
  const { t } = useTranslation(['common']);
  return (
    <>
      {title} {t('common:at_time')} <Time date={time} />
    </>
  );
}
