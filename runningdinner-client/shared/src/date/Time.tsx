import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export interface TimeProps {
  date?: Date;
  includeSeconds?: boolean;
}

function Time({ date, includeSeconds }: TimeProps) {
  const { t } = useTranslation('common');
  if (!date) {
    return null;
  }
  const formattedTime = format(date, includeSeconds ? 'HH:mm:ss' : 'HH:mm');
  return (
    <>
      {formattedTime} {t('uhr')}
    </>
  );
}

export { Time };
