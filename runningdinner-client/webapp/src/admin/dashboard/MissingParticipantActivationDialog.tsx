import { Box, Card, CardContent, Dialog, DialogContent } from "@mui/material";
import { Fullname, LocalDate, ParticipantRegistrationInfo, Time, isStringNotEmpty } from "@runningdinner/shared";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import { DialogTitleCloseable } from "../../common/theme/DialogTitleCloseable";
import { useTranslation } from "react-i18next";
import { SmallTitle, Subtitle } from "../../common/theme/typography/Tags";
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
      <DialogTitleCloseable onClose={onClose}>{t('admin:missing-participant-activation')}</DialogTitleCloseable>
      <DialogContent>
        <Box pt={2}>
          <Paragraph>
            Teilnehmende die sich anmelden, bekommen eine EMail mit einem Bestätigungslink.<br/>
            Es kann leider immer mal wieder vorkommen (insbesondere bei t-online), dass die Emails nicht bei den Teilnehmern ankommen.<br/>
            Es kann aber auch einfach sein, dass die Email-Adressen falsch sind, oder die Teilnehmenden schlicht noch nicht reagiert haben.
          </Paragraph>
          <Box mt={2}>
            <Paragraph>
              Folgende Anmeldungen liegen nun schon länger zurück, wurden aber noch nicht bestätigt.<br/>
              Es wird empfohlen Kontakt aufzunehmen, da unbestätigte Anmeldungen nicht bei der Team-Einteilung berücksichtigt werden, und diese Anmeldungen dann ggfalls. manuell zu bestätigen.
            </Paragraph>
          </Box>
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
