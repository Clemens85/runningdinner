import { Grid } from '@mui/material';
import { LocalDate, Time } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import FormTextField from '../../../common/input/FormTextField';
import FormFieldset from '../../../common/theme/FormFieldset';
import Paragraph from '../../../common/theme/typography/Paragraph';

export interface MiscSectionProps {
  miscNotesHelperText?: string;
  activationDate?: Date;
}

export default function MiscSection(props: MiscSectionProps) {
  const { t } = useTranslation('common');

  const { miscNotesHelperText, activationDate } = props;

  return (
    <>
      <FormFieldset>{t('misc')}</FormFieldset>
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField fullWidth helperText={miscNotesHelperText} variant="filled" name="notes" label={t('misc_notes')} />
        </Grid>

        {activationDate && (
          <Grid size={12}>
            <Paragraph>
              {t('activation_date')} <LocalDate date={activationDate} /> {t('at_time')} <Time date={activationDate} />
            </Paragraph>
          </Grid>
        )}
      </Grid>
    </>
  );
}
