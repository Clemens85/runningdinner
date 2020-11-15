import React from 'react'
import Grid from "@material-ui/core/Grid";
import FormFieldset from "../../../common/theme/FormFieldset";
import {Controller, useFormContext} from "react-hook-form";
import NumberTextInputEmptyValue from "../../../common/input/NumberTextInputEmptyValue";
import TextInput from "../../../common/input/TextInput";
import {useTranslation} from "react-i18next";

export default function AddressSection() {

  const {control} = useFormContext();

  const {t} = useTranslation('common');
  const street = t('street');
  const streetNr = t('street_nr');
  const cityName = t('city');
  const zip = t('zip');
  const addressRemarks = t('address_remarks');
  const numberSeats = t('number_seats');

  return (
      <>
        <FormFieldset>{t('address')}</FormFieldset>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextInput fullWidth
                       variant="filled"
                       required
                       name="street"
                       label={street}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInput fullWidth
                       variant="filled"
                       required
                       name="streetNr"
                       label={streetNr}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInput fullWidth
                       variant="filled"
                       required
                       name="zip"
                       label={zip}/>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextInput fullWidth
                       variant="filled"
                       name="cityName"
                       label={cityName}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller as={NumberTextInputEmptyValue} name="numSeats" control={control} variant="filled" emptyValue={0} fullWidth label={numberSeats} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextInput fullWidth
                       variant="filled"
                       name="addressRemarks"
                       label={addressRemarks}/>
          </Grid>
        </Grid>
      </>
  );
}
