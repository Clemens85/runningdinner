import { Button,ButtonGroup } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  function handleClick(newLanguage: string) {
    i18n.changeLanguage(newLanguage);
  }

  return <LanguageSwitchButtons selectedLanguage={i18n.language} onClick={handleClick} />;
}

export interface LanguageSwitchButtonsProps {
  selectedLanguage?: string;
  onClick: (newLanguage: string) => unknown;
}

export function LanguageSwitchButtons({ selectedLanguage, onClick }: LanguageSwitchButtonsProps) {
  function isLanguageSelected(lang: string) {
    return selectedLanguage === lang;
  }

  const isGermanSelected = isLanguageSelected('de');
  const isEnglishSelected = isLanguageSelected('en');

  return (
    <ButtonGroup variant="contained" aria-label="Switch language" disableRipple>
      <Button
        color={isGermanSelected ? 'primary' : 'inherit'}
        sx={{ color: isGermanSelected ? 'primary' : '#000' }}
        onClick={() => onClick('de')}
        data-testid={`language-switch-de${isGermanSelected ? '-selected' : ''}`}
        disableFocusRipple
        disableRipple
        disableElevation
        disableTouchRipple
      >
        DE
      </Button>
      <Button
        color={isEnglishSelected ? 'primary' : 'inherit'}
        sx={{ color: isEnglishSelected ? 'primary' : '#000' }}
        onClick={() => onClick('en')}
        data-testid={`language-switch-en${isEnglishSelected ? '-selected' : ''}`}
        disableTouchRipple
        disableRipple
        disableElevation
        disableFocusRipple
      >
        EN
      </Button>
    </ButtonGroup>
  );
}
