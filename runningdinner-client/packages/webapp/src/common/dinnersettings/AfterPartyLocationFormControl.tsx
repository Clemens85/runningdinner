import {useTranslation} from "react-i18next";
import {SpacingGrid} from "../theme/SpacingGrid";
import Grid from "@material-ui/core/Grid";
import {Span} from "../theme/typography/Tags";
import FormTextField from "../input/FormTextField";
import FormTimePicker from "../input/FormTimePicker";
import React from "react";

export function AfterPartyLocationFormControl() {

  const {t} = useTranslation(['common']);

  const afterPartyLocationMt = 1;

  return (
    <>
      <SpacingGrid container mt={afterPartyLocationMt} spacing={3}>
        <Grid item xs={12} md={9}>
          <Span i18n={"common:after_event_party_help_1"}/>
          <Span i18n={"common:after_event_party_help_2"}/>
        </Grid>
      </SpacingGrid>
      <SpacingGrid container mt={afterPartyLocationMt} spacing={3}>
        <Grid item xs={12} md={9}>
          <FormTextField name="addressName"
                         label={t('common:after_party_location_name')}
                         helperText={t("common:after_party_location_name_help")}
                         variant="outlined"
                         fullWidth/>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormTimePicker
            id={"time"}
            label={t("common:time")}
            name={"time"}
            data-testid={`after-event-party-time`}/>
        </Grid>
      </SpacingGrid>
      <SpacingGrid container mt={afterPartyLocationMt} spacing={3}>
        <Grid item xs={12} md={9}>
          <FormTextField fullWidth
                         variant="outlined"
                         required
                         name="street"
                         label={t('common:street')}/>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormTextField fullWidth
                         variant="outlined"
                         required
                         name="streetNr"
                         label={t('common:street_nr')}/>
        </Grid>
      </SpacingGrid>
      <SpacingGrid container mt={afterPartyLocationMt} spacing={3}>
        <Grid item xs={12} md={3}>
          <FormTextField name="zip"
                         label={t('common:zip')}
                         required
                         variant="outlined"
                         fullWidth/>
        </Grid>
        <Grid item xs={12} md={9}>
          <FormTextField name="cityName"
                         label={t('common:city')}
                         required
                         variant="outlined"
                         fullWidth/>
        </Grid>
      </SpacingGrid>
      <SpacingGrid container mt={afterPartyLocationMt} spacing={3}>
        <Grid item xs={12} md={9}>
          <FormTextField fullWidth
                         variant="outlined"
                         name="addressRemarks"
                         label={t("common:after_party_location_remarks")}/>
        </Grid>
      </SpacingGrid>
    </>
  );
}