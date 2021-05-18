import React, {useState} from "react";
import {Box, Button, useMediaQuery, useTheme} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {CallbackHandler} from "@runningdinner/shared";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

export function useMasterDetailView() {

  const [showDetailsView, setShowDetailsView] = useState(false);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  const showListView = !isSmallDevice || !showDetailsView;
  const showBackToListViewButton = !showListView;

  return {
    setShowDetailsView,
    showDetailsView,
    showListView,
    showBackToListViewButton
  };
}

export interface BackToListButtonProps {
  onBackToList: CallbackHandler;
}

export function BackToListButton({onBackToList}: BackToListButtonProps) {

  const {t} = useTranslation('common');

  return (
      <Box mb={1} mt={1}>
        <Button startIcon={<ChevronLeftIcon />}
                onClick={onBackToList}>
          {t('back')}
        </Button>
      </Box>
  );
}
