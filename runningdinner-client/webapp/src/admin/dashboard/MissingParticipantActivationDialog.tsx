import { Box, Card, CardContent, Dialog, DialogContent } from "@mui/material";
import { Fullname, LocalDate, ParticipantRegistrationInfo, Time, isStringNotEmpty } from "@runningdinner/shared";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import { DialogTitleCloseable } from "../../common/theme/DialogTitleCloseable";
import { useTranslation } from "react-i18next";
import { SmallTitle } from "../../common/theme/typography/Tags";
import Paragraph from "../../common/theme/typography/Paragraph";
import LinkExtern from "../../common/theme/LinkExtern";
import { FormCheckboxSimple } from "../../common/input/FormCheckboxSimple";
import { useState } from "react";

type MissingParticipantActivationDialogProps = {
  open: boolean;
  onClose: (disableNotification?: boolean) => unknown;
  missingParticipantActivations: ParticipantRegistrationInfo[]
};

function MissingParticipantActivationItem({email, firstnamePart, lastname, createdAt, mobileNumber}: ParticipantRegistrationInfo) {

  const {t} = useTranslation(['common', 'admin']);

  return (
    <Card>
      <CardContent>
        <div><LinkExtern href={`mailto:${email}`}><SmallTitle>{email}</SmallTitle></LinkExtern></div>
        <div><Fullname firstnamePart={firstnamePart} lastname={lastname}/></div>
        <div><Paragraph>Registriert am <LocalDate date={createdAt} /> {t("common:at_time")} <Time date={createdAt} /></Paragraph></div>
        { isStringNotEmpty(mobileNumber) &&
          <>
            <Paragraph>{t("common:mobile")}: <LinkExtern href={`tel:${mobileNumber}`} title={mobileNumber}/></Paragraph>
          </>
        }
      </CardContent>
    </Card>
  )
}

export function MissingParticipantActivationDialog({open, onClose, missingParticipantActivations}: MissingParticipantActivationDialogProps) {
  
  const {t} = useTranslation(['common', 'admin']);

  const [disableNotification, setDisableNotification] = useState(false);

  return (
    <Dialog open={open} onClose={() => onClose()} aria-labelledby="form-dialog-title" data-testid="missing-participant-activation-dialog">
      <DialogTitleCloseable onClose={onClose}>{t('admin:registrations_not_yet_confirmed_old')}</DialogTitleCloseable>
      <DialogContent>
        <Box pt={2}>
          <Paragraph>
            Folgende Anmeldungen liegen länger zurück, wurden aber noch nicht bestätigt.<br/><br/>
            Es kann leider vorkommen, dass die Mails mit den Bestätigungslinks nicht ankommen 
            (insbesondere T-Online blockiert gerne... es kann aber auch sein, dass eine Email-Adresse falsch eingetragen wurde oder ein Teilnehmer schlicht noch nicht reagiert hat).<br/><br/>
            Es wird empfohlen Kontakt aufzunehmen, da unbestätigte Anmeldungen nicht bei der Team-Einteilung berücksichtigt werden.<br/>
            Du kannst diese Anmeldungen jederzeit manuell bestätigen.
          </Paragraph>
        </Box>

        { missingParticipantActivations.map(mpa => 
          <Box key={mpa.id} pt={2}>
            <MissingParticipantActivationItem {...mpa} />
          </Box>
        )}

        <Box mt={3}>
          <FormCheckboxSimple label="Diese Meldung nicht mehr zeigen" 
                              name="disableMissingParticipantActivationDialog" 
                              value={disableNotification}
                              onChange={evt => setDisableNotification(evt.target.checked)} />
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={() => onClose()} onCancel={onClose} okLabel={t('common:ok')} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}
