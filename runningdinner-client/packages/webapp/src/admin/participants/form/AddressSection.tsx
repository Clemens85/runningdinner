import React from 'react'
import Grid from "@material-ui/core/Grid";
import FormFieldset from "../../../common/theme/FormFieldset";
import {Controller, useFormContext} from "react-hook-form";
import {NumberTextInputEmptyValue} from "../../../common/input/NumberTextInputEmptyValue";
import FormTextField from "../../../common/input/FormTextField";
import {useTranslation} from "react-i18next";
import {isStringNotEmpty} from "@runningdinner/shared";


export interface AddressSectionProps {
  headline?: string;
  isNumSeatsRequired?: boolean;
  addressRemarksHelperText?: string;
}

export default function AddressSection(props: AddressSectionProps) {

  const {control} = useFormContext();

  const {t} = useTranslation('common');
  const street = t('street');
  const streetNr = t('street_nr');
  const cityName = t('city');
  const zip = t('zip');
  const addressRemarks = t('address_remarks');
  const numberSeats = t('number_seats');
  const numberSeatsHelp = t('number_seats_help');

  const headline = isStringNotEmpty(props.headline) ? props.headline : t('address');

  const {isNumSeatsRequired} = props;

  // @ts-ignore
  return (
      <>
        <FormFieldset>{headline}</FormFieldset>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <FormTextField fullWidth
                           variant="filled"
                           required
                           name="street"
                           label={street}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormTextField fullWidth
                           variant="filled"
                           required
                           name="streetNr"
                           label={streetNr}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormTextField fullWidth
                           variant="filled"
                           required
                           name="zip"
                           label={zip}/>
          </Grid>
          <Grid item xs={12} md={8}>
            <FormTextField fullWidth
                           variant="filled"
                           name="cityName"
                           required
                           label={cityName}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="numSeats"
              control={control}
              render={props =>
                <NumberTextInputEmptyValue
                  variant="filled"
                  name="numSeats"
                  required={isNumSeatsRequired}
                  label={numberSeats}
                  onChange={newVal => props.onChange(newVal)}
                  value={props.value}
                  helperText={numberSeatsHelp}
                  emptyValue={0}
                  fullWidth />
              }
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <FormTextField fullWidth
                           variant="filled"
                           name="addressRemarks"
                           helperText={props.addressRemarksHelperText}
                           label={addressRemarks}/>
          </Grid>
        </Grid>
      </>
  );
}
