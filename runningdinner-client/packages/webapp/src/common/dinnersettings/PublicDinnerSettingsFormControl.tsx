import React from 'react';
import {useTranslation} from "react-i18next";
import { SpacingGrid } from '../theme/SpacingGrid';
import FormTextField from "../input/FormTextField";
import FormDatePicker from "../input/FormDatePicker";

export function PublicDinnerSettingsFormControl() {

const {t} = useTranslation("common");

  return (
    <>
      <SpacingGrid container>
        <SpacingGrid item xs={12}>
          <FormTextField name="title"
            label={t('common:public_title')}
            required
            helperText={t("common:public_title_help")}
            variant="outlined"
            fullWidth />
        </SpacingGrid>
      </SpacingGrid>
      <SpacingGrid container mt={3}>
        <SpacingGrid item xs={12} >
          <FormDatePicker name={"endOfRegistrationDate"}
            label={t('common:public_end_of_registration_date')}
            inputVariant={"outlined"}
            helperText={t("common:endOfRegistrationDate_help")} />
        </SpacingGrid>
      </SpacingGrid>
      <SpacingGrid container mt={3}>
        <SpacingGrid item xs={12}>
          <FormTextField name="description"
            label={t('common:public_description')}
            multiline
            rows={8}
            required
            variant="outlined"
            fullWidth />
        </SpacingGrid>
      </SpacingGrid>

      <SpacingGrid container mt={3}>
        <SpacingGrid item xs={12}>
          <FormTextField name="publicContactName"
            label={t('common:public_contact_name')}
            required
            helperText={t("common:public_contact_name_help")}
            variant="outlined"
            defaultValue={""}
            fullWidth />
        </SpacingGrid>
      </SpacingGrid>
      <SpacingGrid container mt={3}>
        <SpacingGrid item xs={12}>
          <FormTextField name="publicContactEmail"
            label={t('common:public_contact_email')}
            required
            helperText={t("common:public_contact_email_help")}
            variant="outlined"
            defaultValue={""}
            fullWidth />
        </SpacingGrid>
      </SpacingGrid>
      <SpacingGrid container mt={3}>
        <SpacingGrid item xs={12}>
          <FormTextField name="publicContactMobileNumber"
            label={t('common:public_contact_mobile_number')}
            helperText={t("common:public_contact_mobile_number_help")}
            variant="outlined"
            defaultValue={""}
            fullWidth />
        </SpacingGrid>
      </SpacingGrid>

    </>
  );
}
