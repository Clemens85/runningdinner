import FeedbackIcon from '@mui/icons-material/Feedback';
import { Box, Button, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useDisclosure } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import LinkAction from '../theme/LinkAction';
import Paragraph from '../theme/typography/Paragraph';
import { FeedbackDialog } from './FeedbackDialog';

export type FeedbackButtonProps = {
  labelOverridden?: React.ReactNode;
  showAsLinkWithoutIcon?: boolean;
};

export function FeedbackButton({ labelOverridden, showAsLinkWithoutIcon }: FeedbackButtonProps) {
  const { isOpen, close, open } = useDisclosure();

  const { t } = useTranslation('common');

  const label = labelOverridden ? labelOverridden : t('common:feedback_label');

  return (
    <>
      {showAsLinkWithoutIcon ? (
        <LinkAction onClick={open}>{label}</LinkAction>
      ) : (
        <Button onClick={open} color="primary" startIcon={<FeedbackIcon />}>
          <Paragraph>{label}</Paragraph>
        </Button>
      )}
      {isOpen && <FeedbackDialog onClose={close} />}
    </>
  );
}

export function FeedbackButtonContainerRightAligned() {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid container justifyContent={'flex-end'} alignItems={'center'}>
      <Grid>
        <Box mt={1} mr={isMobileDevice ? 1 : 2}>
          <FeedbackButton />
        </Box>
      </Grid>
    </Grid>
  );
}
