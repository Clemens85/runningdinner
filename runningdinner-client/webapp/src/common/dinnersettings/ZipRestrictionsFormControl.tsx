import { Alert, Box, Chip, Dialog, DialogContent, Grid, Stack, TextField, Typography } from "@mui/material";
import SecondaryButton from "../theme/SecondaryButton";
import { useTranslation } from "react-i18next";
import { calculateResultingZipRestrictions, CallbackHandler, CONSTANTS, isArrayEmpty, isArrayNotEmpty, isStringEmpty, isStringNotEmpty, useDisclosure } from "@runningdinner/shared";
import { t } from "i18next";
import { DialogTitleCloseable } from "../theme/DialogTitleCloseable";
import { useState } from "react";
import { debounce } from "lodash-es";
import DialogActionsPanel from "../theme/DialogActionsPanel";

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
  const buttonLabel = hasZipRestrictions ? `${t("common:label_edit")}...` : t("Anmeldungen auf Postleitzahlen beschränken...");

  return (
    <>
      <Grid item xs={12}>
        <Stack direction="row" gap={1} alignItems="center">
          <Box>
            { hasZipRestrictions && <Typography variant="body2">Anmeldung beschränkt auf Postleitzahlen: {currentZipRestrictions} </Typography> }
            { !hasZipRestrictions && <Typography variant="body2">Anmeldung mit jeder Postleitzahl möglich</Typography> }
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
  const [resultingZipRestrictions, setResultingZipRestrictions] = useState<string[]>([]);
  const [invalidZipRestrictions, setInvalidZipRestrictions] = useState<string[]>([]);

  const calculateResultingZipRestrictionsDebounced = debounce((value ) => {
    const calculationResult = calculateResultingZipRestrictions(value);
    setResultingZipRestrictions(calculationResult.zipRestrictions);
    if (isArrayNotEmpty(invalidZipRestrictions) && isArrayEmpty(calculationResult.invalidZips)) {
      setInvalidZipRestrictions([]);
    }
  }, 150);


  function handleZipRestrictionsChange(event: React.ChangeEvent<HTMLInputElement>) {
    setZipRestrictions(event.target.value);
    calculateResultingZipRestrictionsDebounced(event.target.value);
  }

  function handleSave() {
    setInvalidZipRestrictions([]);
    // Trigger final calculation due to debouncing above:
    const calculationResult = calculateResultingZipRestrictions(zipRestrictions);
    if (isArrayNotEmpty(calculationResult.invalidZips)) {
      setInvalidZipRestrictions(calculationResult.invalidZips);
    } else {
      onSave(zipRestrictions);
    }
  }

  const title = "Anmeldungen auf Postleitzahlen beschränken";
  return (
    <Dialog open={true} onClose={onCancel} aria-labelledby={title}>
      <DialogTitleCloseable onClose={onCancel}>{title}</DialogTitleCloseable>
      <DialogContent>
        <Box pt={2}>
          <Alert severity="info" variant="outlined">
            Deine Stadt ist groß und du willst nur Teilnehmer aus bestimmten Stadtteilen zulassen?<br/>
            Dann kannst du hier die Anmeldung auf Postleitzahlen-Kreise einschränken.<br/>
            Alle anderen Postleitzahlen werden bei der Anmeldung abgelehnt.
          </Alert>

          <Box my={2}>
            <TextField helperText={"Postleitzahlen können sowohl komma-separiert als auch als Reihe eingeben werden. Beispiel: 79098, 79100-79102, 79104"}
                       label={"Erlaubte Postleitzahlen"}
                       onChange={handleZipRestrictionsChange}
                       value={zipRestrictions} 
                       fullWidth />
          </Box>

          { isArrayNotEmpty(resultingZipRestrictions) && 
            <Box>
              <Typography variant="subtitle1">Vorschau</Typography>
              <Grid container spacing={1} sx={{ pt: 1 }}>
                {resultingZipRestrictions.map((zipRestriction, index) => 
                  <Grid key={index} item>
                    <Chip label={zipRestriction} variant="outlined" color="primary" />
                  </Grid>
                )} 
              </Grid>
            </Box>
          }

          {isArrayNotEmpty(invalidZipRestrictions) && 
            <Alert severity="error" variant="outlined" sx={{mt: 2}}>
              Folgende Postleitzahlen-Eingaben sind ungültig: {invalidZipRestrictions.join(", ")}<br/>
              Bitte korrigiere deine Eingabe.
            </Alert>
          }
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={handleSave}
                          onCancel={onCancel} 
                          okLabel={t("common:Übernehmen")} 
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  )
}