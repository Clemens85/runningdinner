import React from 'react'
import { Grid } from "@material-ui/core";
import FormFieldset from "../../../common/theme/FormFieldset";
import FormTextField from "../../../common/input/FormTextField";
import {useTranslation} from "react-i18next";
import {isStringNotEmpty} from "@runningdinner/shared";

export interface MiscSectionProps {
  teamPartnerWishHelperText?: string;
  miscNotesHelperText?: string;
  teamPartnerWishDisabled: boolean;
}

export default function MiscSection(props: MiscSectionProps) {

  const {t} = useTranslation('common');

  const teamPartnerWishHelperText = isStringNotEmpty(props.teamPartnerWishHelperText) ? props.teamPartnerWishHelperText : t('admin:team_partner_wish_help');

  const {teamPartnerWishDisabled} = props;

  return (
      <>
        <FormFieldset>{t('misc')}</FormFieldset>
        <Grid container spacing={2}>
          { !teamPartnerWishDisabled &&
            <Grid item xs={12} md={6}>
              <FormTextField fullWidth
                             helperText={teamPartnerWishHelperText}
                             variant="filled"
                             name="teamPartnerWish"
                             label={t('teampartner_wish')}/>
            </Grid>
          }
          <Grid item xs={12} md={teamPartnerWishDisabled ? 12 : 6}>
            <FormTextField fullWidth
                           helperText={props.miscNotesHelperText}
                           variant="filled"
                           name="notes"
                           label={t('misc_notes')}/>
          </Grid>
        </Grid>
      </>
  );
}
