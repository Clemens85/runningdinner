import React from 'react'
import Grid from "@material-ui/core/Grid";
import ParticipantGenderSelection from "./ParticipantGenderSelection";
import {NumberTextInputEmptyValue} from "../../../common/input/NumberTextInputEmptyValue";
import FormFieldset from "../../../common/theme/FormFieldset";
import {Controller, useFormContext} from "react-hook-form";
import FormTextField from "../../../common/input/FormTextField";
import {useTranslation} from "react-i18next";

export default function PersonalDataSection() {

  const {t} = useTranslation('common');

  const {control} = useFormContext();

  const firstname = t('firstname');
  const lastname = t('lastname');
  const email = t('email');
  const mobileNr = t('mobile');
  const age = t('age');

  return (
      <>
        <FormFieldset>{t('base_data')}</FormFieldset>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormTextField name="firstnamePart"
                           label={firstname}
                           required
                           variant="filled"
                           fullWidth/>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField required
                           variant="filled"
                           fullWidth
                           name="lastname"
                           label={lastname}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField required
                           fullWidth
                           variant="filled"
                           name="email"
                           label={email}
                           type="email"/>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField name="mobileNumber"
                           fullWidth
                           variant="filled"
                           label={mobileNr}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <ParticipantGenderSelection label="Geschlecht" value="gender" id="gender" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
                name="age"
                control={control}
                render={props =>
                    <NumberTextInputEmptyValue
                        variant="filled"
                        name="age"
                        label={age}
                        onChange={newVal => props.onChange(newVal)}
                        value={props.value}
                        emptyValue={0}
                        fullWidth />
                }
            />
          </Grid>
        </Grid>
      </>
  );
}
