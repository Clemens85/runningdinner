import React from 'react';
import {useDisclosure} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {FeedbackDialog} from "./FeedbackDialog";
import {Box, Button, Grid, useMediaQuery, useTheme} from "@material-ui/core";
import Paragraph from "../theme/typography/Paragraph";
import FeedbackIcon from '@material-ui/icons/Feedback';

export function FeedbackButton() {

  const {isOpen, close, open} = useDisclosure();

  const {t} = useTranslation("common");

  return (
    <>
      <Button onClick={open} color="primary" startIcon={<FeedbackIcon />}>
        <Paragraph>{t("common:feedback_label")}</Paragraph>
      </Button>
      { isOpen && <FeedbackDialog onClose={close} /> }
    </>
  );
}

export function FeedbackButtonContainerRightAligned() {

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container justify={"flex-end"} alignItems={"center"}>
      <Grid item>
        <Box mt={1} mr={isMobileDevice ? 1 : 2}>
          <FeedbackButton />
        </Box>
      </Grid>
    </Grid>
  )
}
