import {useTranslation} from "react-i18next";
import {Grid} from "@mui/material";
import FormTextField from "../../../common/input/FormTextField";

export type TeamPartnerWishFormInputProps = {
  teamPartnerWishHelperText: string;
};

export function TeamPartnerWishFormInput({teamPartnerWishHelperText}: TeamPartnerWishFormInputProps) {

  const {t} = useTranslation('common');

  return (
    <>
      <Grid item xs={12}>
        <FormTextField fullWidth
                       helperText={teamPartnerWishHelperText}
                       variant="filled"
                       name="teamPartnerWishEmail"
                       label={t('teampartner_wish')}/>
      </Grid>
    </>
  );
}