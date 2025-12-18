import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

import FormTextField from '../../../common/input/FormTextField';

export type TeamPartnerWishFormInputProps = {
  teamPartnerWishHelperText: string;
};

export function TeamPartnerWishFormInput({ teamPartnerWishHelperText }: TeamPartnerWishFormInputProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Grid size={12}>
        <FormTextField fullWidth helperText={teamPartnerWishHelperText} variant="filled" name="teamPartnerWishEmail" label={t('teampartner_wish')} />
      </Grid>
    </>
  );
}
