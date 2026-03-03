import { Alert, Box, Button } from '@mui/material';
import { HttpError, requestAccessRecovery, useBackendIssueHandler } from '@runningdinner/shared';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormTextField from '../common/input/FormTextField';
import { useNotificationHttpError } from '../common/NotificationHttpErrorHook';

interface AccessRecoveryFormData {
  email: string;
}

export function AccessRecoveryForm() {
  const { t } = useTranslation('portal');
  const [submitted, setSubmitted] = useState(false);

  const { applyValidationIssuesToForm, getIssuesTranslated } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const formMethods = useForm<AccessRecoveryFormData>({ defaultValues: { email: '' } });
  const { handleSubmit, setError, formState: { isSubmitting } } = formMethods;

  const onSubmit = async (data: AccessRecoveryFormData) => {
    try {
      await requestAccessRecovery(data.email);
      setSubmitted(true);
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };

  if (submitted) {
    return <Alert severity="success">{t('access_recovery_success')}</Alert>;
  }

  return (
    <FormProvider {...formMethods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        <FormTextField
          name="email"
          label={t('access_recovery_email_label')}
          placeholder={t('access_recovery_email_placeholder')}
          type="email"
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
          {t('access_recovery_submit')}
        </Button>
      </Box>
    </FormProvider>
  );
}
