import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

import FormDatePicker from '../input/FormDatePicker';
import FormTextField from '../input/FormTextField';

export interface PublicDinnerSettingsFormControlProps {
  mediumDeviceHalfSize: boolean;
}

export function PublicDinnerSettingsFormControl({ mediumDeviceHalfSize }: PublicDinnerSettingsFormControlProps) {
  const { t } = useTranslation('common');

  const md = mediumDeviceHalfSize ? 6 : undefined;

  return (
    <>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            md: md,
          }}
        >
          <FormTextField name="title" label={t('common:public_title')} required helperText={t('common:public_title_help')} variant="outlined" fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }}>
        <Grid
          size={{
            xs: 12,
            md: md,
          }}
        >
          <FormDatePicker name={'endOfRegistrationDate'} label={t('common:public_end_of_registration_date')} helperText={t('common:endOfRegistrationDate_help')} />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }}>
        <Grid size={12}>
          <FormTextField name="description" label={t('common:public_description')} multiline rows={10} required variant="outlined" fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }}>
        <Grid
          size={{
            xs: 12,
            md: md,
          }}
        >
          <FormTextField
            name="publicContactName"
            label={t('common:public_contact_name')}
            required
            helperText={t('common:public_contact_name_help')}
            variant="outlined"
            defaultValue={''}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }}>
        <Grid
          size={{
            xs: 12,
            md: md,
          }}
        >
          <FormTextField
            name="publicContactEmail"
            label={t('common:public_contact_email')}
            required
            helperText={t('common:public_contact_email_help')}
            variant="outlined"
            defaultValue={''}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }}>
        <Grid
          size={{
            xs: 12,
            md: md,
          }}
        >
          <FormTextField
            name="publicContactMobileNumber"
            label={t('common:public_contact_mobile_number')}
            helperText={t('common:public_contact_mobile_number_help')}
            variant="outlined"
            defaultValue={''}
            fullWidth
          />
        </Grid>
      </Grid>
    </>
  );
}
