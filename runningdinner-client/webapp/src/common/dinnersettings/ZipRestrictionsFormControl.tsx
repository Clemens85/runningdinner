import { Alert, Box, Chip, Dialog, DialogContent, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SecondaryButton from "../theme/SecondaryButton";
import { Trans, useTranslation } from "react-i18next";
import { calculateResultingZipRestrictions, CallbackHandler, CONSTANTS, isArrayEmpty, isArrayNotEmpty, isStringEmpty, isStringNotEmpty, useDisclosure } from "@runningdinner/shared";
import { t } from "i18next";
import { DialogTitleCloseable } from "../theme/DialogTitleCloseable";
import { useState } from "react";
import { debounce } from "lodash-es";
import DialogActionsPanel from "../theme/DialogActionsPanel";
import ClearIcon from '@mui/icons-material/Clear';

export type ZipRestrictionsFormControlProps = {
  currentRegistrationType: string;
  currentZipRestrictions: string;
  onUpdateZipRestrictions: (zipRestrictions: string) => unknown;
};

export function ZipRestrictionsFormControl({currentRegistrationType, currentZipRestrictions, onUpdateZipRestrictions}: ZipRestrictionsFormControlProps) {

  const {t} = useTranslation(['common']);

  const {open, isOpen, close} = useDisclosure();

  if (isStringEmpty(currentRegistrationType) || currentRegistrationType === CONSTANTS.REGISTRATION_TYPE.CLOSED) {
    return null;
  }

  function handleOpenEditZipRestrictionsDialog() {
    open();
  }

  function handleSaveZipRestrictions(zipRestrictions: string) {
    close();
    onUpdateZipRestrictions(zipRestrictions);
  }

  const hasZipRestrictions = isStringNotEmpty(currentZipRestrictions);
  const buttonLabel = hasZipRestrictions ? `${t("common:label_edit")}...` : t("common:zip_restrictions_add");

  return (
    <>
      <Grid item xs={12} sx={{ mt: 1, mb: 2 }}>
        <Stack direction="row" gap={1} alignItems="center">
          <Box>
            { hasZipRestrictions && <Typography variant="body2">{t("common:zip_restrictions_enabled")} <strong>{currentZipRestrictions}</strong></Typography> }
            { !hasZipRestrictions && <Typography variant="body2">{t("common:zip_restrictions_disabled")}</Typography> }
          </Box>
          <Box>
            <SecondaryButton color={"primary"} 
                             variant={"outlined"}
                             size={"small"}
                             onClick={handleOpenEditZipRestrictionsDialog}>
              {buttonLabel}
            </SecondaryButton>
          </Box>
        </Stack>
      </Grid>
      { isOpen && <EditZipRestrictionsDialog currentZipRestrictions={isStringNotEmpty(currentZipRestrictions) ? currentZipRestrictions : ""}
                                             onSave={handleSaveZipRestrictions}
                                             onCancel={close} /> }
    </>
  )
}

type EditZipRestrictionsDialogProps = {
  onCancel: CallbackHandler;
  currentZipRestrictions: string;
  onSave: (zipRestrictions: string) => unknown;
}
function EditZipRestrictionsDialog({onCancel, onSave, currentZipRestrictions}: EditZipRestrictionsDialogProps) {

  const [zipRestrictions, setZipRestrictions] = useState(currentZipRestrictions);
  const [resultingZipRestrictions, setResultingZipRestrictions] = useState<string[]>(() => calculateResultingZipRestrictions(currentZipRestrictions).zipRestrictions);
  const [invalidZipRestrictions, setInvalidZipRestrictions] = useState<string[]>([]);

  const calculateResultingZipRestrictionsDebounced = debounce((value ) => {
    const calculationResult = calculateResultingZipRestrictions(value);
    setResultingZipRestrictions(calculationResult.zipRestrictions);
    if (isArrayNotEmpty(invalidZipRestrictions) && isArrayEmpty(calculationResult.invalidZips)) {
      setInvalidZipRestrictions([]);
    }
  }, 150);


  function handleZipRestrictionsChange(newVal: string) {
    setZipRestrictions(newVal);
    calculateResultingZipRestrictionsDebounced(newVal);
  }

  function handleSave() {
    setInvalidZipRestrictions([]);
    // Trigger final calculation due to debouncing above:
    const calculationResult = calculateResultingZipRestrictions(zipRestrictions);
    if (isArrayNotEmpty(calculationResult.invalidZips)) {
      setInvalidZipRestrictions(calculationResult.invalidZips);
    } else {
      // Remove trailing comma if present
      const normalizedZipRestritions = isStringNotEmpty(zipRestrictions) && zipRestrictions.trim().endsWith(",") ? zipRestrictions.trim().slice(0, -1) : zipRestrictions.trim();
      onSave(normalizedZipRestritions);
    }
  }

  const title = "Anmeldungen auf Postleitzahlen beschränken";
  const hasZipRestrictions = isStringNotEmpty(currentZipRestrictions);

  return (
    <Dialog open={true} onClose={onCancel} aria-labelledby={title}>
      <DialogTitleCloseable onClose={onCancel}>{title}</DialogTitleCloseable>
      <DialogContent>
        <Box pt={2}>

          { !hasZipRestrictions &&
            <Alert severity="info" variant="outlined">
              <Trans i18nKey="common:zip_restrictions_add_info"/>
            </Alert>
          }

          { hasZipRestrictions &&
            <Alert severity="info" variant="outlined">
              <Trans i18nKey="common:zip_restrictions_edit_info"/>
            </Alert>
          }

          <Box my={2}>
            <TextField helperText={t("common:zip_restrictions_input_help")}
                       label={t("zip_restrictions_input_label")}
                       onChange={(evt) => handleZipRestrictionsChange(evt.target.value)}
                       value={zipRestrictions} 
                       InputProps={{
                        endAdornment: 
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => handleZipRestrictionsChange("")}>
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                       }}
                       fullWidth />
          </Box>

          <Box>
            <Typography variant="subtitle1">{t("common:zip_restrictions_enabled")}</Typography>
            <Grid container spacing={1} sx={{ pt: 1 }}>
              {resultingZipRestrictions.map((zipRestriction, index) => 
                <Grid key={index} item>
                  <Chip label={zipRestriction} variant="outlined" color="primary" />
                </Grid>
              )} 
              { isStringEmpty(zipRestrictions) && 
                <Grid item>
                  <Typography variant="body2">{t("common:zip_restrictions_disabled")}</Typography>
                </Grid>
              }
            </Grid>
          </Box>
          
          {isArrayNotEmpty(invalidZipRestrictions) && 
            <Alert severity="error" variant="outlined" sx={{mt: 2}}>
              <Trans i18nKey="common:zip_restrictions_invalid" values={{ invalidZipRestrictions: invalidZipRestrictions.join(", ") }} />
            </Alert>
          }
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={handleSave}
                          onCancel={onCancel} 
                          okLabel={t("common:apply")} 
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  )
}