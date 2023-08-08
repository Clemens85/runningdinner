import React from 'react'
import { Grid } from "@mui/material";
import FormFieldset from "../../../common/theme/FormFieldset";
import FormTextField from "../../../common/input/FormTextField";
import {useTranslation} from "react-i18next";

export interface MiscSectionProps {
  miscNotesHelperText?: string;
}

export default function MiscSection(props: MiscSectionProps) {

  const {t} = useTranslation('common');

  return (
      <>
        <FormFieldset>{t('misc')}</FormFieldset>
        <Grid container spacing={2}>
          <Grid item xs={12}>
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
