import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {Typography} from "@material-ui/core";
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
