import Grid from '@mui/material/Grid';
import { isStringNotEmpty } from '@runningdinner/shared';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormTextField from '../../../common/input/FormTextField';
import { NumberFormTextFieldEmptyValueAllowed } from '../../../common/input/NumberTextInputEmptyValue';
import FormFieldset from '../../../common/theme/FormFieldset';
import ParticipantGenderSelection from './ParticipantGenderSelection';

export type PersonalDataSectionProps = {
  isTeamPartnerWishChild?: boolean;
};

export function PersonalDataSection({ isTeamPartnerWishChild }: PersonalDataSectionProps) {
  const { t } = useTranslation('common');

  const firstname = t('firstname');
  const lastname = t('lastname');
  const email = t('email');
  const mobileNr = t('mobile');
  const age = t('age');

  const { watch } = useFormContext();
  const emailValue = watch('email');
  const mobileNumberValue = watch('mobileNumber');

  const showEmailInput = isStringNotEmpty(emailValue) || !isTeamPartnerWishChild;
  const showMobileNumberInput = isStringNotEmpty(mobileNumberValue) || !isTeamPartnerWishChild;

  return (
    <>
      <FormFieldset>{t('base_data')}</FormFieldset>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <FormTextField name="firstnamePart" label={firstname} required autoFocus variant="filled" fullWidth />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <FormTextField required variant="filled" fullWidth name="lastname" label={lastname} />
        </Grid>
        {showEmailInput && (
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <FormTextField required={!isTeamPartnerWishChild} fullWidth variant="filled" name="email" label={email} type="email" />
          </Grid>
        )}
        {showMobileNumberInput && (
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <FormTextField name="mobileNumber" fullWidth variant="filled" label={mobileNr} />
          </Grid>
        )}
        {!isTeamPartnerWishChild && (
          <>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <ParticipantGenderSelection label={t('common:gender')} value="gender" />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <NumberFormTextFieldEmptyValueAllowed name="age" emptyValue={0} label={age} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
