import React from 'react'
import { Grid } from "@material-ui/core";
import FormFieldset from "../../../common/theme/FormFieldset";
import TextInput from "../../../common/input/TextInput";
import {useTranslation} from "react-i18next";

export default function MiscSection() {

  const {t} = useTranslation('common');

  const teamPartnerWishHelperText = t('admin:team_partner_wish_help');

  return (
      <>
        <FormFieldset>{t('misc')}</FormFieldset>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput fullWidth
                       helperText={teamPartnerWishHelperText}
                       variant="filled"
                       name="teamPartnerWish"
                       label={t('teampartner_wish')}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput fullWidth
                       variant="filled"
                       name="notes"
                       label={t('misc_notes')}/>
          </Grid>
        </Grid>
      </>
  );
}
