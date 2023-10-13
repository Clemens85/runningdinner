import React from 'react'
import Grid from "@mui/material/Grid";
import ParticipantGenderSelection from "./ParticipantGenderSelection";
import {
  NumberFormTextFieldEmptyValueAllowed,
} from "../../../common/input/NumberTextInputEmptyValue";
import FormFieldset from "../../../common/theme/FormFieldset";
import FormTextField from "../../../common/input/FormTextField";
import {useTranslation} from "react-i18next";

export type PersonalDataSectionProps = {
  showOnlyNameFields?: boolean;
};

export function PersonalDataSection({showOnlyNameFields}: PersonalDataSectionProps) {

  const {t} = useTranslation('common');

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
          { !showOnlyNameFields &&
            <>
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
                <ParticipantGenderSelection label={t('common:gender')} value="gender" />
              </Grid>
              <Grid item xs={12} md={6}>
                <NumberFormTextFieldEmptyValueAllowed name="age"
                                                      emptyValue={0}
                                                      label={age} />
              </Grid>
            </>
          }
        </Grid>
      </>
  );
}
