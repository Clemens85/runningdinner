import React from 'react';
import {Trans, useTranslation} from "react-i18next";
import {useWizardSelector} from "./WizardStore";
import {
  getRunningDinnerSelector,
  isDemoDinnerSelector,
  setNextNavigationStep,
  setPreviousNavigationStep,
  updateWithCreatedRunningDinner
} from "./WizardSlice";
import {useDispatch} from "react-redux";
import {FormProvider, useForm} from "react-hook-form";
import {
  CONSTANTS,
  createRunningDinnerAsync,
  ParticipantPreviewNavigationStep, RunningDinner,
  SummaryNavigationStep,
  useBackendIssueHandler,
} from "@runningdinner/shared";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import {PageTitle, Subtitle} from "../common/theme/typography/Tags";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import FormTextField from "../common/input/FormTextField";
import WizardButtons from "./WizardButtons";
import Paragraph from "../common/theme/typography/Paragraph";
import Grid from "@material-ui/core/Grid";
import FormCheckbox from "../common/input/FormCheckbox";
import LinkExtern from "../common/theme/LinkExtern";
import {Box} from "@material-ui/core";

export default function FinishStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const isDemoDinner = useWizardSelector(isDemoDinnerSelector);
  const runningDinner = useWizardSelector(getRunningDinnerSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: runningDinner,
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset } = formMethods;

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  React.useEffect(() => {
    reset(runningDinner);
    clearErrors();
    // eslint-disable-next-line
  }, [reset, clearErrors, runningDinner]);

  React.useEffect(() => {
    dispatch(setNextNavigationStep(SummaryNavigationStep));
    dispatch(setPreviousNavigationStep(ParticipantPreviewNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);

  const submitRunningDinnerAsync = async(values: RunningDinner) => {
    clearErrors();
    const runningDinnerToSubmit = {...runningDinner};
    runningDinnerToSubmit.email = values.email;
    // TODO: Contract!
    try {
      const createRunningDinnerResponse = await createRunningDinnerAsync(runningDinnerToSubmit);
      dispatch(updateWithCreatedRunningDinner(createRunningDinnerResponse));
      return true;
    } catch(e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
      return false;
    }
  };

  return (

    <div>
      <PageTitle>{t('almost_there')}</PageTitle>
      <FormProvider {...formMethods}>
        <form>
          <SpacingGrid container>
            <SpacingGrid item xs={12} md={6}>
              <FormTextField name="email"
                             label={t('administration_email_label' )}
                             required
                             helperText={
                               <Trans i18nKey="wizard:email_administration_link_help" />
                             }
                             variant="outlined"
                             fullWidth />
            </SpacingGrid>
          </SpacingGrid>

          { !isDemoDinner && <ContractSettings /> }

          <WizardButtons onSubmitData={submitRunningDinnerAsync} />

        </form>
      </FormProvider>
    </div>
  );
}

function ContractSettings() {

  const {t} = useTranslation(['wizard', 'common']);

  return (
    <>
      <SpacingGrid container mt={3}>
        <Grid item xs={12}>
          <Subtitle i18n="wizard:adv_headline" />
          <Paragraph><Trans i18nKey="wizard:adv_text_question" /></Paragraph>
          <Box mt={1}>
            <Paragraph><Trans i18nKey="wizard:adv_text_answer" /></Paragraph>
          </Box>
          <Box mt={1}>
            <Paragraph>
              <Trans i18nKey="wizard:adv_text_help"
                  // @ts-ignore
                     components={{ anchor: <LinkExtern /> }} />
            </Paragraph>
          </Box>
          <Box mt={1}>
            <Paragraph mt={1}><Trans i18nKey="wizard:adv_text_address_help" /></Paragraph>
          </Box>
        </Grid>
      </SpacingGrid>

      <SpacingGrid container mt={3} spacing={3}>
        <Grid item xs={12} md={6}>
          <FormTextField name="contract.fullname"
                         label={t('common:fullname' )}
                         required
                         variant="outlined"
                         fullWidth/>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormTextField name="contract.streetWithNr"
                         label={t('common:street' )}
                         required
                         variant="outlined"
                         fullWidth/>
        </Grid>
      </SpacingGrid>

      <SpacingGrid container mt={3} spacing={3}>
        <Grid item xs={4}>
          <FormTextField name="contract.zip"
                         label={t('common:zip' )}
                         required
                         variant="outlined"
                         fullWidth/>
        </Grid>
        <Grid item xs={8}>
          <FormTextField name="contract.city"
                         label={t('common:city' )}
                         required
                         variant="outlined"
                         fullWidth/>
        </Grid>
      </SpacingGrid>

      <SpacingGrid container mt={3}>
        <Grid item xs={12}>
          <FormCheckbox name="newsletterEnabled"
                        label={
                          <Trans i18nKey="common:newsletter_label" values={{globalAdminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL}} />
                        } />
        </Grid>
      </SpacingGrid>
    </>
  );
}
