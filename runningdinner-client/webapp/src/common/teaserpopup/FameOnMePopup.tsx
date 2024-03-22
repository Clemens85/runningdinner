import React from "react";
import { useTeaserPopup } from "./useTeaserPopup"
import { Box, Button, Dialog, DialogActions, DialogContent, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DialogTitleCloseable } from "../theme/DialogTitleCloseable";
import { FormCheckboxSimple } from "../input/FormCheckboxSimple";
import { useTranslation } from "react-i18next";
import { CallbackHandler } from "@runningdinner/shared";
import { commonStyles } from "../theme/CommonStyles";
import { PrimaryButton } from "../theme/PrimaryButton";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Show until 2024-04-10
const showUntil = new Date(2024, 3, 10);

export function FameOnMePopup() {
  
  const [remindMe, setRemindMe] = React.useState(false);

  const {closeTeaserPopup, setTeaserPopupOpenIfSuitable, showTeaserPopup} = useTeaserPopup({popupKey: "fameonme", showUntil});

  React.useEffect(() => {
    setTeaserPopupOpenIfSuitable();
  }, [setTeaserPopupOpenIfSuitable]);

  
  if (showTeaserPopup) {
    return <FameOnMePopupView onClose={() => closeTeaserPopup(remindMe)} remindMe={remindMe} onRemindMeChanged={setRemindMe} />;
  }
  return null;
}

type RemindMeProps = {
  remindMe: boolean;
  onRemindMeChanged: (remindMe: boolean) => unknown;
  onClose: CallbackHandler;
};

function FameOnMePopupView({remindMe, onRemindMeChanged, onClose}: RemindMeProps) {

  const {t} = useTranslation("common");

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  const title = "Hobbyköche aus Köln & 100 km Umkreis gesucht"

  return (
    <Dialog onClose={onClose} open={true} maxWidth={"md"}>
    <DialogTitleCloseable onClose={onClose}>{title}</DialogTitleCloseable>
    <DialogContent>
      <TeaserParagraph>
        <i>
          Der nachfolgende Inhalt wird von FameOnMe / SAT.1 bereitgestellt.<br/>
          Nein, wir bekommen weder eine Provision dafür noch steigen wir jetzt ins Werbegeschäft ein.
          Da es aber potenziell interessant für manche Nutzer/innen sein könnte, wollen wir euch das nicht vorenthalten:
        </i>
      </TeaserParagraph>
      <TeaserParagraph>
        Ihr stellt euch gerne neuen Herausforderungen und liebt das Experimentieren in der Küche? 
        Für ein neues SAT.1 Koch-Duell suchen wir Familien & Paare aus <strong>Nordrhein-Westfalen</strong>, die in der Küche ein unschlagbares Team sind. 
        Gerne auch WGs oder andere 2er Teams wie z.B. Vater/Tochter die <strong>Spaß am Kochen</strong> mitbringen!
      </TeaserParagraph>
      <TeaserParagraph>
        Zwei Teams kämpfen in der Küche um den Sieg. Wer kann den Starkoch <strong>Alexander Kumptner</strong> mit seinen Kreationen bezaubern und sahnt das Preisgeld ab? 
        Wenn ihr die nötige Kreativität besitzt, aus einfachen Zutaten außergewöhnliche Gaumenfreuden zu zaubern, bewerbt euch jetzt!
      </TeaserParagraph>
      <TeaserParagraph>
        <strong>Derzeit suchen wir ausschließlich Personen aus Köln & 100km Umkreis.</strong> Geplant sind 1-2 Drehtage, ihr kocht dabei in eurer eigenen Küche!
      </TeaserParagraph>
      <TeaserParagraph addLineBreak={false}>
        Interesse an mehr Infos? Diese findest du hier: <br/>
        <Button color="primary" variant="outlined" endIcon={<OpenInNewIcon />} sx={{ mt: 1 }}
                href="https://www.fameonme.de/bewerbung/das-schnaeppchen-menue-koch-challenge-sat1/" target="_blank">
          <Typography variant={"body1"} component={"span"}>Zur Koch Challenge</Typography>
        </Button>
      </TeaserParagraph>
    <Box mt={2}>
        <FormCheckboxSimple label={t("common:remind_me")} 
                            name="remindMe" 
                            value={remindMe}
                            onChange={evt => onRemindMeChanged(evt.target.checked)} />
      </Box>
    </DialogContent>
    <DialogActions>
      <Box sx={{ ...fullWidthProps, p: 2 }}>
        <PrimaryButton onClick={onClose} size={"medium"} sx={fullWidthProps} data-testid="dialog-submit">{t('common:close')}</PrimaryButton>
      </Box>
    </DialogActions>
  </Dialog>
  )
}

type TeaserParagraphProps = {
  children: React.ReactNode;
  addLineBreak?: boolean;
};

function TeaserParagraph({children, addLineBreak = true}: TeaserParagraphProps) {
  return (
    <>
      <Typography variant={"subtitle1"} component="p">{children}</Typography>
      { addLineBreak && <br/> }
    </>
  );

}