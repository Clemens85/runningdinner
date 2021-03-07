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

export function LanguageSwitch() {

  const { i18n } = useTranslation();

  function handleClick(newLanguage: string) {
    i18n.changeLanguage(newLanguage);
  }

  return <LanguageSwitchButtons selectedLanguage={i18n.language} onClick={handleClick} />
}

export interface LanguageSwitchButtonsProps {
  selectedLanguage?: string;
  onClick: (newLanguage: string) => unknown;
}

export function LanguageSwitchButtons({selectedLanguage, onClick}: LanguageSwitchButtonsProps) {

  const classes = useStyles();

  function isLanguageSelected(lang: string) {
    return selectedLanguage === lang;
  }

  return (
      <ButtonGroup variant="contained" aria-label="Switch language">
        <Button className={clsx(isLanguageSelected('de') && classes.selectedLanguageBtn)} onClick={() => onClick('de')}>DE</Button>
        <Button className={clsx(isLanguageSelected('en') && classes.selectedLanguageBtn)} onClick={() => onClick('en')}>EN</Button>
      </ButtonGroup>
  );
}
