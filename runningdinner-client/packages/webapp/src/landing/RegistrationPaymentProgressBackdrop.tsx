import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import {Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import Paragraph from "../common/theme/typography/Paragraph";

const useBackdropStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }),
);

export function RegistrationPaymentProgressBackdrop() {

  const classes = useBackdropStyles();
  const {t} = useTranslation("landing");

  return (
    <Backdrop className={classes.backdrop} open={true}>
      <CircularProgress color="inherit" />
      <Paragraph>&nbsp; {t("landing:payment_processing")}</Paragraph>
    </Backdrop>
  );
}
