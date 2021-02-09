import React from "react";
import { ButtonGroup, Button, makeStyles } from "@material-ui/core";
import {useTranslation} from "react-i18next";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  selectedLanguageBtn: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&hover': {
      backgroundColor: theme.palette.primary.main
    }
  }
}));

export default function LanguageSwitch(props) {

  const { i18n } = useTranslation();

  const classes = useStyles();

  function handleClick(newLanguage) {
    i18n.changeLanguage(newLanguage);
  }

  function isLanguageSelected(lang) {
    return i18n.language === lang;
  }

  return (
      <ButtonGroup variant="contained" aria-label="Switch language">
        <Button className={clsx(isLanguageSelected('de') && classes.selectedLanguageBtn)} onClick={() => handleClick('de')}>DE</Button>
        <Button className={clsx(isLanguageSelected('en') && classes.selectedLanguageBtn)} onClick={() => handleClick('en')}>EN</Button>
      </ButtonGroup>
  );
}
