import React, {useState} from "react";
import {Box, Button, useMediaQuery, useTheme} from "@mui/material";
import {useTranslation} from "react-i18next";
import {CallbackHandler} from "@runningdinner/shared";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export function useMasterDetailView() {

  const [showDetailsView, setShowDetailsView] = useState(false);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('lg'));

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
  mt?: number;
  mb?: number;
}

export function BackToListButton({onBackToList, mt, mb}: BackToListButtonProps) {

  const {t} = useTranslation('common');

  const mtToSet = mt ? mt : 1;
  const mbToSet = mb ? mb : 1;

  return (
      <Box mt={mtToSet} mb={mbToSet}>
        <Button startIcon={<ChevronLeftIcon />}
                style={{ paddingLeft: 0 }}
                onClick={onBackToList}>
          {t('back')}
        </Button>
      </Box>
  );
}
