import {
  BaseAdminIdProps,
  BaseRunningDinnerProps,
  fetchPaymentOptions,
  getPaymentOptionsFetchSelector,
  useAdminDispatch,
  useAdminSelector,
  FetchStatus,
  useBackendIssueHandler,
  PaymentOptions,
  isNewEntity,
  createOrUpdatePaymentOptionsAsync,
  newEmptyPaymentOptions,
  updatePaymentOptions, deletePaymentOptionsAsync
} from "@runningdinner/shared";
import React from "react";
import {PageTitle} from "../../common/theme/typography/Tags";
import {SpacingGrid} from "../../common/theme/SpacingGrid";
import {useTranslation} from "react-i18next";
import {useForm, FormProvider} from "react-hook-form";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import SecondaryButton from "../../common/theme/SecondaryButton";
import useCommonStyles from "../../common/theme/CommonStyles";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import FormTextField from "../../common/input/FormTextField";
import Paragraph from "../../common/theme/typography/Paragraph";

export function PaymentOptionsPage({runningDinner}: BaseRunningDinnerProps) {

  const dispatch = useAdminDispatch();
  const {adminId} = runningDinner;

  const {data: paymentOptions, fetchStatus} = useAdminSelector(getPaymentOptionsFetchSelector);

  React.useEffect(() => {
    dispatch(fetchPaymentOptions(adminId));
  }, [dispatch, adminId]);

  if (fetchStatus !== FetchStatus.SUCCEEDED) {
    return null;
  }

  if (!paymentOptions) {
    return <NewPaymentOptionsView />;
  }
  return (
    <><PaymentOptionsFormView paymentOptions={paymentOptions} adminId={runningDinner.adminId} /></>
  );
}


function NewPaymentOptionsView() {

  const {t} = useTranslation(["admin", "common"]);
  const dispatch = useAdminDispatch();

  return (
    <>
      <PageTitle>{t('admin:payment_options')}</PageTitle>
      <Paragraph i18n={"admin:payment_options_help"} />
      <SpacingGrid container justify={"flex-start"} mt={3}>
        <SpacingGrid item>
          <PrimaryButton onClick={() => dispatch(updatePaymentOptions(newEmptyPaymentOptions()))} size="large">
            {t('admin:payment_options_create')}
          </PrimaryButton>
        </SpacingGrid>
      </SpacingGrid>
    </>
  );
}

type PaymentOptionsFormViewProps = {
  paymentOptions: PaymentOptions;
} & BaseAdminIdProps;

function PaymentOptionsFormView({paymentOptions, adminId}: PaymentOptionsFormViewProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {showSuccess} = useCustomSnackbar();
  const classes = useCommonStyles();
  const dispatch = useAdminDispatch();

  const formMethods = useForm({
    defaultValues: paymentOptions,
    mode: 'onTouched'
  });
  const { clearErrors, setError, handleSubmit, reset, formState } = formMethods;

  React.useEffect(() => {
    if (paymentOptions) {
      reset({
        ...paymentOptions
      });
    }
    clearErrors();
    // eslint-disable-next-line
  }, [paymentOptions, reset, clearErrors]);

  const {applyValidationIssuesToForm} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['common', 'admin']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  async function savePaymentOptions(values: PaymentOptions) {
    const paymentOptionsToSave = {
      id: !isNewEntity(paymentOptions) ? paymentOptions.id : undefined,
      ...values
    };
    try {
      const updatedPaymentOptions = await createOrUpdatePaymentOptionsAsync(adminId, paymentOptionsToSave);
      showSuccess(t("admin:payment_options_save_success"));
      dispatch(updatePaymentOptions(updatedPaymentOptions));
    } catch (e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
    }
  }

  async function deletePaymentOptions() {
    try {
      await deletePaymentOptionsAsync(adminId, paymentOptions.id!);
      showSuccess(t("admin:payment_options_delete_success"));
      dispatch(updatePaymentOptions(undefined));
    } catch (e) {
      showHttpErrorDefaultNotification(e);
    }

  }

  const showDeleteBtn = !isNewEntity(paymentOptions);

  return (
    <>
      <PageTitle>{t('admin:payment_options')}</PageTitle>

      <Paragraph i18n={"admin:payment_options_edit_help"} />

      <FormProvider {...formMethods}>
        <form>

          <SpacingGrid container mt={3}>
            <SpacingGrid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             required
                             name="brandName"
                             label={t('common:brand_name')}/>
            </SpacingGrid>
          </SpacingGrid>

          <SpacingGrid container my={3}>
            <SpacingGrid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             required
                             name="pricePerRegistration"
                             helperText={"admin:price_per_registration_help"}
                             label={t('common:price_per_registration')}/>
            </SpacingGrid>
          </SpacingGrid>

          <SpacingGrid container mt={3}>
            <SpacingGrid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             name="agbLink"
                             helperText={t("admin:agb_link_help")}
                             label={t('admin:agb_link')}/>
            </SpacingGrid>
          </SpacingGrid>

          <SpacingGrid container mt={3}>
            <SpacingGrid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             name="redirectAfterPurchaseLink"
                             helperText={t("admin:redirect_after_purchase_link_help")}
                             label={t('admin:redirect_after_purchase_link')}/>
            </SpacingGrid>
          </SpacingGrid>

          <SpacingGrid container justify={"flex-start"} mt={3}>
            <SpacingGrid item xs={12} md={4}>
              { showDeleteBtn && <SecondaryButton onClick={deletePaymentOptions}>{t('common:delete')}</SecondaryButton> }
              <PrimaryButton onClick={handleSubmit(savePaymentOptions)} disabled={formState.isSubmitting} size={"large"}
                             className={showDeleteBtn ? classes.buttonSpacingLeft : ""}>
                {t('common:save')}
              </PrimaryButton>
            </SpacingGrid>
          </SpacingGrid>

        </form>
      </FormProvider>
    </>
  );
}