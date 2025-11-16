import Grid from '@mui/material/Grid';
import { isStringNotEmpty } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FormTextField from '../../../common/input/FormTextField';
import { NumberFormTextFieldEmptyValueAllowed } from '../../../common/input/NumberTextInputEmptyValue';
import FormFieldset from '../../../common/theme/FormFieldset';

export interface AddressSectionProps {
  headline?: string;
  isNumSeatsRequired?: boolean;
  addressRemarksHelperText?: string;
}

export default function AddressSection(props: AddressSectionProps) {
  const { t } = useTranslation('common');
  const street = t('street');
  const streetNr = t('street_nr');
  const cityName = t('city');
  const zip = t('zip');
  const addressRemarks = t('address_remarks');
  const numberSeats = t('number_seats');
  const numberSeatsHelp = t('number_seats_help');

  const headline = isStringNotEmpty(props.headline) ? props.headline : t('address');

  const { isNumSeatsRequired } = props;

  // @ts-ignore
  return (
    <>
      <FormFieldset>{headline}</FormFieldset>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <FormTextField fullWidth variant="filled" required name="street" label={street} />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormTextField fullWidth variant="filled" required name="streetNr" label={streetNr} />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormTextField fullWidth variant="filled" required name="zip" label={zip} />
        </Grid>
        <Grid item xs={12} md={8}>
          <FormTextField fullWidth variant="filled" name="cityName" required label={cityName} />
        </Grid>
        <Grid item xs={12} md={4}>
          <NumberFormTextFieldEmptyValueAllowed name="numSeats" label={numberSeats} emptyValue={-1} helperText={numberSeatsHelp} required={isNumSeatsRequired} fullWidth />
        </Grid>
        <Grid item xs={12} md={8}>
          <FormTextField fullWidth variant="filled" name="addressRemarks" helperText={props.addressRemarksHelperText} label={addressRemarks} />
        </Grid>
      </Grid>
    </>
  );
}
