import { HttpError, useBackendIssueHandler } from '@runningdinner/shared';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormTextField from '../input/FormTextField';
import { useNotificationHttpError } from '../NotificationHttpErrorHook';

type TeamNameFormValues = {
  teamName: string;
};

type UseTeamNameFormProps = {
  initialTeamName?: string;
  /**
   * Called with the entered name. An empty name means that the custom name shall be removed.
   * Validation happens only in the backend, whose validation errors are shown at the form field.
   */
  saveTeamName: (teamName: string) => Promise<unknown>;
};

/**
 * Form handling for editing a custom team name. Used by admins and participants.
 */
export function useTeamNameForm({ initialTeamName, saveTeamName }: UseTeamNameFormProps) {
  const formMethods = useForm<TeamNameFormValues>({
    defaultValues: { teamName: initialTeamName || '' },
    mode: 'onTouched',
  });
  const { clearErrors, setError, handleSubmit } = formMethods;

  const { applyValidationIssuesToForm, getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  /**
   * @returns true if the name was successfully saved
   */
  const submit = async (): Promise<boolean> => {
    let saved = false;
    await handleSubmit(async (values) => {
      clearErrors();
      try {
        await saveTeamName(values.teamName);
        saved = true;
      } catch (e) {
        applyValidationIssuesToForm(e as HttpError, setError);
        showHttpErrorDefaultNotification(e as HttpError);
      }
    })();
    return saved;
  };

  return { formMethods, submit };
}

type TeamNameFormProps = {
  formMethods: ReturnType<typeof useTeamNameForm>['formMethods'];
  onSubmit: () => unknown;
};

export function TeamNameForm({ formMethods, onSubmit }: TeamNameFormProps) {
  const { t } = useTranslation('admin');
  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          onSubmit();
        }}
      >
        <FormTextField name="teamName" label={t('admin:team_name')} helperText={t('admin:team_name_help')} variant="outlined" fullWidth autoFocus />
      </form>
    </FormProvider>
  );
}
