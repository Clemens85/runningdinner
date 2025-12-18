import { Grid } from '@mui/material';
import { SpacingProps } from '@mui/system';
import { useTranslation } from 'react-i18next';

import SecondaryButton from '../theme/SecondaryButton';

type AfterPartyLocationToggleButtonProps = {
  afterPartyLocationEnabled: boolean;
  onToggleAfterPartyLocation: (enable: boolean) => unknown;
};

export function AfterPartyLocationToggleButton(props: AfterPartyLocationToggleButtonProps & SpacingProps) {
  const { t } = useTranslation(['common']);

  const { afterPartyLocationEnabled, onToggleAfterPartyLocation, ...spacingProps } = props;

  return (
    <Grid container justifyContent={'flex-start'} sx={spacingProps}>
      <Grid>
        {!afterPartyLocationEnabled && (
          <SecondaryButton color={'primary'} variant={'outlined'} onClick={() => onToggleAfterPartyLocation(true)}>
            {t('common:after_party_location_add')}
          </SecondaryButton>
        )}
        {afterPartyLocationEnabled && (
          <SecondaryButton color={'secondary'} variant={'outlined'} onClick={() => onToggleAfterPartyLocation(false)}>
            {t('common:after_party_location_remove')}
          </SecondaryButton>
        )}
      </Grid>
    </Grid>
  );
}
