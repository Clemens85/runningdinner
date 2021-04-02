import React from 'react';
import {Trans, useTranslation} from "react-i18next";
import {useWizardSelector} from "@runningdinner/shared";
import {
  getRunningDinnerSelector,
  isDemoDinnerSelector,
  setNextNavigationStep,
  setPreviousNavigationStep,
  updateWithCreatedRunningDinner
} from "@runningdinner/shared";
import {useDispatch} from "react-redux";
import {FormProvider, useForm} from "react-hook-form";
import {
  CONSTANTS, Contract,
  createRunningDinnerAsync, CreateRunningDinnerWizardModel,
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
    defaultValues: newFormModel(runningDinner),
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset } = formMethods;

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  React.useEffect(() => {
    reset(newFormModel(runningDinner));
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
    const runningDinnerToSubmit = {
        ...runningDinner,
        email: values.email,
        contract: { ...values }
    };
    try {
      const createRunningDinnerResponse = await createRunningDinnerAsync(runningDinnerToSubmit);
      // Backend responds with an empty Contract, but we need it in state, otherwise our form will crash after dispatch
      createRunningDinnerResponse.runningDinner.contract = runningDinnerToSubmit.contract;
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

          { !isDemoDinner && <ContractSettings contract={runningDinner.contract} /> }

          <WizardButtons onSubmitData={submitRunningDinnerAsync} />

        </form>
      </FormProvider>
    </div>
  );
}

interface ContractProps {
  contract: Contract
}
function ContractSettings({contract}: ContractProps) {

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
          <FormTextField name="fullname"
                         label={t('common:fullname' )}
                         required
                         variant="outlined"
                         defaultValue={contract.fullname}
                         fullWidth/>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormTextField name="streetWithNr"
                         label={t('common:street' )}
                         required
                         variant="outlined"
                         defaultValue={contract.streetWithNr}
                         fullWidth/>
        </Grid>
      </SpacingGrid>

      <SpacingGrid container mt={3} spacing={3}>
        <Grid item xs={4}>
          <FormTextField name="zip"
                         label={t('common:zip' )}
                         required
                         variant="outlined"
                         defaultValue={contract.zip}
                         fullWidth/>
        </Grid>
        <Grid item xs={8}>
          <FormTextField name="city"
                         label={t('common:city' )}
                         variant="outlined"
                         defaultValue={contract.city}
                         fullWidth/>
        </Grid>
      </SpacingGrid>

      <SpacingGrid container mt={3}>
        <Grid item xs={12}>
          <FormCheckbox name="newsletterEnabled"
                        useTableDisplay={true}
                        defaultValue={contract.newsletterEnabled}
                        label={
                          <Trans i18nKey="common:newsletter_label" values={{globalAdminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL}} />
                        } />
        </Grid>
      </SpacingGrid>
    </>
  );
}


// By accident our email field in Contract has same name as our email field in RunningDinner, hence we can just use this interface as our model
interface FinishFormModel extends Contract {
}

/**
 * Unfortunately our backend deliver contract-issues not with "contract." prefix, but just as flat attribute name.
 * Hence we create our own flat form model to cope with this.
 *
 * @param runningDinner
 */
function newFormModel(runningDinner: CreateRunningDinnerWizardModel): FinishFormModel {
  return {
    email: runningDinner.email,
    zip: runningDinner.contract?.zip,
    city: runningDinner.contract?.city,
    streetWithNr: runningDinner.contract?.streetWithNr,
    fullname: runningDinner.contract?.fullname,
    newsletterEnabled: runningDinner.contract?.newsletterEnabled,
  }
}
