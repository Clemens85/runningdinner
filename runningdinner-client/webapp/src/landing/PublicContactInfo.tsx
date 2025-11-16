import { isStringNotEmpty, RunningDinnerPublicSettings } from '@runningdinner/shared';
import { t } from 'i18next';
import FormFieldset from '../common/theme/FormFieldset';
import Paragraph from '../common/theme/typography/Paragraph';
import { Link } from '@mui/material';

export function PublicContactInfo(publicSettings: RunningDinnerPublicSettings) {
  return (
    <>
      <FormFieldset>{t('common:contact')}</FormFieldset>
      {isStringNotEmpty(publicSettings.publicContactName) && (
        <Paragraph>
          {t('common:organizer')}: {publicSettings.publicContactName}
        </Paragraph>
      )}
      {isStringNotEmpty(publicSettings.publicContactEmail) && (
        <Paragraph>
          {t('common:email')}: &nbsp;
          <Link href={`mailto:${publicSettings.publicContactEmail}`} underline="hover">
            {publicSettings.publicContactEmail}
          </Link>
        </Paragraph>
      )}
      {isStringNotEmpty(publicSettings.publicContactMobileNumber) && (
        <Paragraph>
          {t('common:mobile')}: {publicSettings.publicContactMobileNumber}
        </Paragraph>
      )}
    </>
  );
}
