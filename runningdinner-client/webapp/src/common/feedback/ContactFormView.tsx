import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

import FormTextField from '../input/FormTextField';
import { IMPRESSUM_PATH } from '../mainnavigation/NavigationPaths';
import LinkExtern from '../theme/LinkExtern';
import { Span } from '../theme/typography/Tags';

export function ContactFormView() {
  return (
    <>
      <Box mb={2}>
        <Span>
          <Trans i18nKey={'common:feedback_text'} />
        </Span>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormTextField name="senderEmail" label={t('common:email')} required variant="filled" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <FormTextField required variant="filled" fullWidth multiline rows={9} name="message" label={t('common:content')} />
        </Grid>

        <Grid item xs={12}>
          <small>
            <Trans
              i18nKey={'common:feedback_privacy_text'}
              values={{ impressumLink: `/${IMPRESSUM_PATH}` }}
              // @ts-ignore
              components={{ anchor: <LinkExtern /> }}
            />
          </small>
        </Grid>
      </Grid>
    </>
  );
}
