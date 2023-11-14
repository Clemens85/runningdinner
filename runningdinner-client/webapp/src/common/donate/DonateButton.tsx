import { Box, Button, Dialog, DialogActions, DialogContent, Typography, useMediaQuery, useTheme } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Trans, useTranslation } from "react-i18next";
import { DialogTitleCloseable } from "../theme/DialogTitleCloseable";
import { CONSTANTS, useDisclosure } from "@runningdinner/shared";
import Paragraph from "../theme/typography/Paragraph";
import SecondaryButton from "../theme/SecondaryButton";
import LinkExtern from "../theme/LinkExtern";
import { commonStyles } from "../theme/CommonStyles";
import { PrimarySuccessButtonAsync } from "../theme/PrimarySuccessButtonAsync";
import { useState } from "react";
import { DialogActionsButtons } from "../theme/dialog/DialogActionsButtons";
import { FormCheckboxSimple } from "../input/FormCheckboxSimple";

export enum DonateDialogType {
  STANDARD,
  TEAM_MESSAGES,
  DINNER_ROUTE_MESSAGES
}

type DonateDialogProps = {
  onClose: (remindMe: boolean) => unknown;
  donateDialogType: DonateDialogType;
}

const donationLink = "https://www.paypal.com/donate/?hosted_button_id=GDVG7J8G3GSF4";

export function DonateButton() {
  
  const {isOpen, close, open} = useDisclosure();

  const {t} = useTranslation("common");

  return (
    <>
      <Button color={"primary"}
              startIcon={<FavoriteIcon />}
              sx={{ borderRadius: 28}}
              variant={"contained"}
              onClick={open}>
        {t("common:donate")}
      </Button>
      { isOpen && <DonateDialog onClose={close} donateDialogType={DonateDialogType.STANDARD}  /> }
    </>
  );
}

export function DonateDialog({onClose, donateDialogType}: DonateDialogProps) {

  const {t} = useTranslation("common");

  const [remindMe, setRemindMe] = useState(false);

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};
  
  const handleClose = () => {
    onClose(remindMe);
  }

  const title = donateDialogType === DonateDialogType.STANDARD ? "Liebe Nutzerinnen und Nutzer" : "Bist du zufrieden mit runyourdinner?";

  return (
    <Dialog onClose={handleClose} open={true} maxWidth={"md"}>
      <DialogTitleCloseable onClose={handleClose}>{title}</DialogTitleCloseable>
      <DialogContent>
        { donateDialogType === DonateDialogType.STANDARD && <StandardDonateContent /> }
        { donateDialogType === DonateDialogType.TEAM_MESSAGES && <TeamMessagesDonateContent remindMe={remindMe} 
                                                                                            onRemindMeChanged={setRemindMe} /> }
        { donateDialogType === DonateDialogType.DINNER_ROUTE_MESSAGES && <DinnerRouteMessagesDonateContent /> }                                                                                      
      </DialogContent>
      <DialogActions>
        <DialogActionsButtons okButton={<PrimarySuccessButtonAsync onClick={() => onClose(false)} 
                                                                   href={donationLink} 
                                                                   target="_blank"
                                                                   rel="noopener noreferrer"
                                                                   size={"medium"} 
                                                                   sx={fullWidthProps} data-testid="dialog-submit">
                                          {t('common:donate_continue')}
                                        </PrimarySuccessButtonAsync>} 
                              cancelButton={<SecondaryButton onClick={handleClose} sx={fullWidthProps} data-testid="dialog-cancel">{t('common:not_now')}</SecondaryButton>}/>
      </DialogActions>

      <NoPaypalLink />

    </Dialog>
  )
}

type RemindMeProps = {
  remindMe: boolean;
  onRemindMeChanged: (remindMe: boolean) => unknown;
};

function TeamMessagesDonateContent({remindMe, onRemindMeChanged}: RemindMeProps) {

  const {t} = useTranslation("common");

  return (
    <>
      <Paragraph>
        Wahrscheinlich kommt das jetzt ungelegen, aber dennoch, bitte nicht einfach wegklicken!
      </Paragraph><br/>
      <Paragraph>
        Wenn dir runyourdinner dein Leben als Event Organisator/in leichter gemacht oder dich vielleicht sogar begeistert hat, 
        so überlege doch bitte hierfür etwas zu spenden.<br/>
        Denn jeder Beitrag, egal ob klein oder groß, hilft weiter, auch künftig eigene Events ohne Werbung & Co veranstalten zu können.
      </Paragraph><br/>
      <Paragraph>
        Die meisten Event-Veranstalter/innen erheben oft eine kleine Teilnahmegebühr. Oft gibt es auch eine After-Event-Party an welcher Geld gesammelt wird.<br/>
        Wenn du von jedem Teilnehmer einen kleinen Teil der Gebühr einsammelst und als Summe spendest wäre sehr geholfen und niemand hat viel Geld ausgegeben.
      </Paragraph><br/>

      <ThanksForSupport/>

      <Box my={2}>
        <i>Selbstverständlich sind weiterhin alle Funktionen ohne Spende zugänglich, es gibt keine Zwei-Klassen-Behandlung.</i>
      </Box>

      <Box mt={2}>
        <FormCheckboxSimple label={t("common:remind_me")} 
                            name="remindMe" 
                            value={remindMe}
                            onChange={evt => onRemindMeChanged(evt.target.checked)} />
      </Box>
    </>
  );
}

function DinnerRouteMessagesDonateContent() {
  return (
    <>
      <Paragraph>
        Du bist nun beim finalen Schritt, nämlich dem Versand der Dinner-Routen angelangt, und wolltest eine Erinnerung zur Spende.
      </Paragraph><br/>

      <Paragraph>
        Es wurde bereits alles gesagt, wir würden uns sehr über eine Spende freuen, insbesondere wenn dir runyourdinner bei der Organisation deines Events geholfen hat.
      </Paragraph><br/>
      
      <Paragraph>
        Du kannst jederzeit - natürlich auch nach Stattfinden deines Events - durch den Spenden-Button in der Navigation eine Spende hinterlegen.
      </Paragraph><br/>

      <ThanksForSupport/>
    </>
  );
}

function StandardDonateContent() {
  return (
    <>
    <Paragraph>
      Mit <i>runyourdinner</i> bieten wir eine kostenlose und werbefreie Plattform zur Durchführung von Running Dinner Events an, welche so in dieser Form einmalig ist.
    </Paragraph><br/>
    <Paragraph>
      Die Plattform wird ohne kommerziellen Anspruch entwickelt und betrieben, und die Kosten für Server, Wartung und Entwicklung werden aus eigener Tasche gedeckt. 
      Deine Spende hilft diese Kosten zu tragen und die Plattform aufrechtzuerhalten.<br/>
    </Paragraph><br/>
    <Paragraph>
    Jeder Beitrag, ob klein oder groß, ist willkommen und und sorgt dafür, dass es auch weiterhin kostenlos und werbefrei bleiben kann 
    und das auch künftig neue tolle Features hinzukommen.
    </Paragraph><br/>
    <ThanksForSupport/>
    </>
  );
}

function ThanksForSupport() {

  const {t} = useTranslation("common");
  return (
    <Paragraph>
      {t("common:donate_thanks_support")}
    </Paragraph>
  )
}

function NoPaypalLink() {

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  const link = <Typography variant={"caption"}>
    <cite>
      <Trans i18nKey={"common:donate_no_paypal_contact"}
        // @ts-ignore
        components={{ anchor: <LinkExtern /> }}
        values={{ email: CONSTANTS.GLOBAL_ADMIN_EMAIL }} />
    </cite>
  </Typography>;

  if (isMobileDevice) {
    return <Box sx={{ p: 2 }}>{link}</Box>;
  }

  return (
    <DialogContent sx={{ pt: 0 }}>
      {link}
    </DialogContent>
  )
}