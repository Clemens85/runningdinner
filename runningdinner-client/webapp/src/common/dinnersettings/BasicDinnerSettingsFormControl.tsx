import FormSelect from '../input/FormSelect';
import { getByValue, LabelValue } from '@runningdinner/shared';
import { Box, FormHelperText, FormLabel, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import FormTextField from '../input/FormTextField';
import FormDatePicker from '../input/FormDatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { LanguageSwitchButtons } from '../i18n/LanguageSwitch';
import { useTranslation } from 'react-i18next';
import { ZipRestrictionsFormControl } from './ZipRestrictionsFormControl';

export interface BasicDinnerSettingsFormControlProps {
  registrationTypes: LabelValue[];
}

export function BasicDinnerSettingsFormControl({ registrationTypes }: BasicDinnerSettingsFormControlProps) {
  const { t } = useTranslation(['common']);
  const { control, watch, setValue } = useFormContext();

  const selectedRegistrationTypeValue = watch('registrationType');
  const currentZipRestrictions = watch('zipRestrictions');

  function handleUpdateZipRestrictions(zipRestrictions: string) {
    setValue('zipRestrictions', zipRestrictions);
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12} md={6}>
          <FormSelect
            name="registrationType"
            variant={'outlined'}
            label={t('common:registration_type')}
            helperText={getByValue(selectedRegistrationTypeValue, registrationTypes)?.description}
            fullWidth
          >
            {registrationTypes.map((registrationType) => (
              <MenuItem value={registrationType.value} key={registrationType.value}>
                {registrationType.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <FormTextField name="title" label={t('common:title')} required helperText={t('common:title_help')} variant="outlined" fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{ mt: 3 }} spacing={3}>
        <Grid item xs={12} md={3}>
          <FormTextField name="zip" label={t('common:zip')} required variant="outlined" helperText={t('common:zip_help')} fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormTextField name="city" label={t('common:city')} required variant="outlined" fullWidth />
        </Grid>

        <ZipRestrictionsFormControl
          currentRegistrationType={selectedRegistrationTypeValue}
          currentZipRestrictions={currentZipRestrictions}
          onUpdateZipRestrictions={handleUpdateZipRestrictions}
        />

        <Grid item xs={12} md={3}>
          <FormDatePicker name={'date'} label={t('common:date')} />
        </Grid>
      </Grid>

      <Grid container sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <FormLabel>{t('common:event_language_label')}</FormLabel>
          <Box my={1}>
            <Controller
              name="languageCode"
              control={control}
              render={({ field }) => <LanguageSwitchButtons selectedLanguage={field.value} onClick={(languageCode: string) => field.onChange(languageCode)} />} // props contains: onChange, onBlur and value
            />
          </Box>
          <FormHelperText>{t('common:event_language_help')}</FormHelperText>
        </Grid>
      </Grid>
    </>
  );
}
