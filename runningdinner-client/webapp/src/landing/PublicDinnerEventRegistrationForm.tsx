import {
  Alert,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Link,
  Paper,
} from "@mui/material";
import {
  assertDefined,
  BasePublicDinnerProps,
  calculateResultingZipRestrictions,
  CallbackHandler,
  finalizeRegistrationOrder,
  HttpError,
  isStringEmpty,
  isStringNotEmpty,
  newEmptyRegistrationDataInstance,
  performRegistration,
  performRegistrationValidation,
  PublicRunningDinner,
  RegistrationData,
  RegistrationDataCollection,
  useBackendIssueHandler,
  useDisclosure,
} from "@runningdinner/shared";
import {Trans, useTranslation} from "react-i18next";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import {FormProvider, useForm} from "react-hook-form";
import {Subtitle} from "../common/theme/typography/Tags";
import {PersonalDataSection} from "../admin/participants/form/PersonalDataSection";
import AddressSection from "../admin/participants/form/AddressSection";
import MealSpecificsSection from "../admin/participants/form/MealSpecificsSection";
import MiscSection from "../admin/participants/form/MiscSection";
import SecondaryButton from "../common/theme/SecondaryButton";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {useEffect} from "react";
import FormCheckbox from "../common/input/FormCheckbox";
import LinkExtern from "../common/theme/LinkExtern";
import {IMPRESSUM_PATH} from "../common/mainnavigation/NavigationPaths";
import { useUrlQuery } from "../common/hooks/useUrlQuery";
import { getDecodedQueryParam } from "../common/QueryParamDecoder";
import {TeamPartnerWishSectionRegistration} from "../admin/participants/form/TeamPartnerWishSectionRegistration";
import {RegistrationSummaryDialog} from "./RegistrationSummaryDialog";
import {RegistrationFormDrawer} from "./LandingStyles";
import {RegistrationPaymentProgressBackdrop} from "./RegistrationPaymentProgressBackdrop";
import {useCustomSnackbar} from "../common/theme/CustomSnackbarHook";
import {commonStyles} from "../common/theme/CommonStyles";
import { useQuery } from "@tanstack/react-query";
import { ConfirmationDialog } from "../common/theme/dialog/ConfirmationDialog";
import Paragraph from "../common/theme/typography/Paragraph";
import { PublicContactInfo } from "./PublicContactInfo";

type BaseRegistrationFormProps = {
  onCancel: CallbackHandler;
  onRegistrationPerformed: (registrationData: RegistrationData) => unknown;
} & BasePublicDinnerProps;


type RegistrationOrderHandlerProps = {
  token: string;
  capturePayment: boolean;
} & BaseRegistrationFormProps;

type RegistrationFormProps = {
  prefilledRegistrationData?: RegistrationData;
} & BaseRegistrationFormProps;


export function PublicDinnerEventRegistrationFormContainer(props: BaseRegistrationFormProps) {

  const query = useUrlQuery();
  const registrationOrderToken = getDecodedQueryParam(query, "token");
  const callbackUrlType = getDecodedQueryParam(query, "callbackUrlType");

  if (isStringEmpty(registrationOrderToken)) {
    return <PublicDinnerEventRegistrationForm {...props} />;
  }
  return <PublicDinnerEventRegistrationOrderHandler token={registrationOrderToken}
                                                    capturePayment={callbackUrlType === "RETURN"}
                                                    {...props}  />
}

function PublicDinnerEventRegistrationOrderHandler({token, capturePayment, publicRunningDinner, onCancel, onRegistrationPerformed}: RegistrationOrderHandlerProps) {

  const {showError} = useCustomSnackbar();
  const {t} = useTranslation(["landing", "common"]);
  const publicDinnerId = publicRunningDinner.publicSettings.publicDinnerId;

  const {isPending, error, data} = useQuery({
    queryKey: ['finalizeRegistrationOrder', publicDinnerId, token, capturePayment],
    queryFn: () => finalizeRegistrationOrder(publicDinnerId, token, capturePayment)
  })

  if (isPending) {
    return <RegistrationPaymentProgressBackdrop />
  }
  if (error) {
    showError(t("landing:registration_payment_error"));
    return null;
  }

  assertDefined(data);

  if (capturePayment) {
    onRegistrationPerformed(data);
    return null;
  } else {
    return <PublicDinnerEventRegistrationForm publicRunningDinner={publicRunningDinner}
                                              onRegistrationPerformed={onRegistrationPerformed}
                                              prefilledRegistrationData={data}
                                              onCancel={onCancel} />
  }
}

function PublicDinnerEventRegistrationForm({onCancel, onRegistrationPerformed, publicRunningDinner, prefilledRegistrationData}: RegistrationFormProps) {

  const publicDinnerId = publicRunningDinner.publicSettings.publicDinnerId;
  const {teamPartnerWishDisabled} = publicRunningDinner;

  const {t} = useTranslation(['landing', 'common']);

  const query = useUrlQuery();

  const { isOpen: isRegistrationSummaryOpen,
          open: openRegistrationSummary,
          close: closeRegistrationSummary,
          getIsOpenData: getRegistrationDataCollection } = useDisclosure<RegistrationDataCollection>();

  const { isOpen: isZipRestrictionDialogOpen,
          open: openZipRestrictionDialog,
          close: closeZipRestrictionDialog} = useDisclosure();

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const invitingParticipantEmail = getDecodedQueryParam(query, "invitingParticipantEmail");
  const prefilledEmailAddress = getDecodedQueryParam(query, "prefilledEmailAddress");

  const formMethods = useForm({
    defaultValues: newEmptyRegistrationDataInstance(invitingParticipantEmail, prefilledEmailAddress),
    mode: 'onTouched'
  });
  const {handleSubmit, clearErrors, setError, formState, reset} = formMethods;
  const {isSubmitting} = formState;

  useEffect(() => {
    if (prefilledRegistrationData) {
      reset(prefilledRegistrationData);
      clearErrors();
    }
  }, [prefilledRegistrationData, reset, clearErrors]);

  const submitRegistrationData = async (values: RegistrationData) => {
    const registrationData = { ...values };
    clearErrors();
    try {
      const registrationSummary = await performRegistrationValidation(publicDinnerId, registrationData);
      openRegistrationSummary({registrationSummary, registrationData});
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      if (hasZipRestrictionIssue(e as HttpError)) {
        clearErrors();
        openZipRestrictionDialog();
      } else {
        showHttpErrorDefaultNotification(e as HttpError);
      }
    }
  };

  async function handlePerformRegistration() {
    const registrationCollection = closeRegistrationSummary();
    if (!registrationCollection) { // Just here for compiler
      throw Error("Expected registration summary dialog to return an object containing the needed data!");
    }
    const {registrationData} = registrationCollection;
    try {
      await performRegistration(publicDinnerId, registrationData);
      onRegistrationPerformed(registrationData);
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  function hasZipRestrictionIssue(error: HttpError): boolean {
    const issues = getIssuesTranslated(error);
    return issues.issuesFieldRelated.some(issue => issue.field === 'zipRestrictions');
  }

  return <>
    <RegistrationFormDrawer open={true}
                            anchor="right"
                            onClose={onCancel}
                            ModalProps={{keepMounted: true}}>
      <div>
        <Paper elevation={3}>
          <Box p={3}>
            <FormProvider {...formMethods}>
              <form>
                <Grid container justifyContent={"space-between"} alignItems={"baseline"}>
                  <Grid item xs={12}>
                    <Subtitle i18n={"landing:registration"}/>
                  </Grid>
                </Grid>
                <Box mb={3} mt={3}>
                  <PersonalDataSection />
                </Box>
                <Box mb={3}>
                  <AddressSection headline={t('landing:address_data')}
                                  isNumSeatsRequired={true}
                                  addressRemarksHelperText={t("landing:address_remarks_help")}/>
                </Box>
                <Box mb={3}>
                  <MealSpecificsSection />
                </Box>
                <Box mb={3}>
                  { !teamPartnerWishDisabled && <TeamPartnerWishSectionRegistration invitingParticipantEmail={invitingParticipantEmail} publicDinnerId={publicDinnerId} /> }
                </Box>
                <Box mb={3}>
                  <MiscSection miscNotesHelperText={t('landing:misc_notes_help')} />
                </Box>
                <Box mb={3}>
                  <FormCheckbox name="dataProcessingAcknowledged"
                                useTableDisplay={true}
                                defaultValue={false}
                                data-testid={"dataProcessingAcknowledged"}
                                label={
                                  <>
                                    <Trans i18nKey="landing:data_processing_acknowledge" /><br />
                                    <Trans i18nKey="landing:data_processing_acknowledge_hint"
                                           values={{ privacyLink: `/${IMPRESSUM_PATH}` }}
                                           // @ts-ignore
                                           components={{ anchor: <LinkExtern /> }} />
                                  </>
                                } />
                </Box>

                {isSubmitting && <LinearProgress/>}

                <Grid container justifyContent={"flex-end"}>
                  <Grid item>
                    <SecondaryButton onClick={onCancel}>{t('common:cancel')}</SecondaryButton>
                    <PrimaryButton onClick={handleSubmit(submitRegistrationData)}
                                   disabled={isSubmitting}
                                   data-testid={"registration-form-next-action"}
                                   size={"large"}
                                   sx={commonStyles.buttonSpacingLeft}>
                      {t('common:next')}
                    </PrimaryButton>
                  </Grid>
                </Grid>

              </form>
            </FormProvider>

          </Box>
        </Paper>
      </div>
    </RegistrationFormDrawer>
    { isRegistrationSummaryOpen && <RegistrationSummaryDialog registrationDataCollection={getRegistrationDataCollection()}
                                                              publicRunningDinner={publicRunningDinner}
                                                              onCancel={closeRegistrationSummary}
                                                              onPerformRegistration={handlePerformRegistration} /> }

    { isZipRestrictionDialogOpen && 
      <ConfirmationDialog open={isZipRestrictionDialogOpen} 
                          onClose={closeZipRestrictionDialog}
                          dialogTitle={t('landing:registration_not_possible')}
                          dialogContent={<ZipRestrictionDialogView publicRunningDinner={publicRunningDinner} />}
                          buttonConfirmText={t('common:ok')}>
                          
      </ConfirmationDialog>
      }
  </>;
}

type ZipRestrictionDialogViewProps = {
  publicRunningDinner: PublicRunningDinner;
}

function ZipRestrictionDialogView({publicRunningDinner}: ZipRestrictionDialogViewProps) {

  const {publicSettings} = publicRunningDinner;
  const title = publicSettings.title;

  const resultingZipRestrictions = calculateResultingZipRestrictions(publicRunningDinner.zipRestrictions);
  
  return (
    <>
    <Alert severity="info" variant="outlined">
      <Trans i18nKey="landing:registration_not_possible_zip_restriction" values={{title}} />
    </Alert>

    <Box my={2}>
      <PublicContactInfo {...publicSettings} />
    </Box>

    <Box my={2}>
      <Trans i18nKey={"common:zip_restrictions_enabled"} />
      <Grid container spacing={1} sx={{ pt: 1 }}>
        {resultingZipRestrictions.zipRestrictions.map((zipRestriction: string, index: number) => 
          <Grid key={index} item>
            <Chip label={zipRestriction} variant="outlined" color="primary" />
          </Grid>
        )} 
      </Grid>

    </Box>
    </>
  );
}