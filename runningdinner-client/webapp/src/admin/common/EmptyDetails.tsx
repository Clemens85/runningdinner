import { Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useDynamicFullscreenHeight } from '../../common/hooks/DynamicFullscreenHeightHook';
import { useMasterDetailView } from '../../common/hooks/MasterDetailViewHook';

type EmptyDetailsProps = {
  labelI18n: string;
};

export const EmptyDetails = ({ labelI18n }: EmptyDetailsProps) => {
  const { t } = useTranslation('admin');

  const paperRef = useRef(null);
  const paperHeight = useDynamicFullscreenHeight(paperRef, 300);

  const { showDetailsView } = useMasterDetailView();
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <div ref={paperRef}>
      {!showDetailsView && !isSmallDevice && (
        <Paper style={{ height: paperHeight, display: 'flex' }} elevation={3} id="empty-details">
          <Grid container justifyContent={'center'} alignItems={'center'}>
            <Grid>
              <Typography variant="subtitle2" sx={{ px: 2 }}>
                {t(labelI18n)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </div>
  );
};
