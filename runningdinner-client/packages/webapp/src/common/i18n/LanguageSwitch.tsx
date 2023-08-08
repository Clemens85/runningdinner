import React from "react";
import { ButtonGroup, Button } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {useTranslation} from "react-i18next";
import clsx from "clsx";

const useLanguageButtonStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&hover': {
      backgroundColor: `theme.palette.primary.main ! important`,
    },
    '&active': {
      backgroundColor: `theme.palette.primary.main ! important`
    },
    '&focus': {
      backgroundColor: `theme.palette.primary.main ! important`
    },
    '&visited': {
      backgroundColor: `theme.palette.primary.main ! important`
    }
  }
}));

const useButtonGroupStyles = makeStyles({
  root: {
    "&:hover": {
      backgroundColor: "transparent"
    },
    '&active': {
      backgroundColor: "transparent"
    },
    '&focus': {
      backgroundColor: "transparent"
    },
    '&visited': {
      backgroundColor: "transparent"
    }
  }
});

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

  const languageButtonClasses = useLanguageButtonStyles();
  const buttonGroupClasses = useButtonGroupStyles();

  function isLanguageSelected(lang: string) {
    return selectedLanguage === lang;
  }

  const isGermanSelected = isLanguageSelected('de');
  const isEnglishSelected = isLanguageSelected('en');

  return (
      <ButtonGroup variant="contained" aria-label="Switch language" disableRipple className={buttonGroupClasses.root}>
        <Button className={clsx(isGermanSelected && languageButtonClasses.root)}
                onClick={() => onClick('de')}
                data-testid={`language-switch-de${isGermanSelected ? '-selected' : ''}`}
                disableFocusRipple
                disableRipple
                disableElevation
                disableTouchRipple>DE</Button>
        <Button className={clsx(isEnglishSelected && languageButtonClasses.root)}
                onClick={() => onClick('en')}
                data-testid={`language-switch-en${isEnglishSelected ? '-selected' : ''}`}
                disableTouchRipple
                disableRipple
                disableElevation
                disableFocusRipple>EN</Button>
      </ButtonGroup>
  );
}
