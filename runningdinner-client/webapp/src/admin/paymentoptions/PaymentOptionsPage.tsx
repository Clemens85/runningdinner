import {Grid} from "@mui/material";
import {
  BaseAdminIdProps,
  BaseRunningDinnerProps,
  useBackendIssueHandler,
  PaymentOptions,
  isNewEntity,
  createOrUpdatePaymentOptionsAsync,
  newEmptyPaymentOptions,
  deletePaymentOptionsAsync, findPaymentOptionsAsync, 
  HttpError
} from "@runningdinner/shared";
import React from "react";
import {PageTitle} from "../../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {useForm, FormProvider} from "react-hook-form";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import SecondaryButton from "../../common/theme/SecondaryButton";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import FormTextField from "../../common/input/FormTextField";
import Paragraph from "../../common/theme/typography/Paragraph";
import {commonStyles} from "../../common/theme/CommonStyles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchProgressBar, isQuerySucceeded } from "../../common/FetchProgressBar";

export function PaymentOptionsPage({runningDinner}: BaseRunningDinnerProps) {

  const {adminId} = runningDinner;

  const paymentOptionsQuery = useQuery({
    queryKey: ['findPaymentOptions', adminId],
    queryFn: () => findPaymentOptionsAsync(adminId),
    refetchOnMount: 'always'
  });

  if (!isQuerySucceeded(paymentOptionsQuery)) {
    return <FetchProgressBar {... paymentOptionsQuery} />
  }

  if (!paymentOptionsQuery.data) {
    return <NewPaymentOptionsView adminId={runningDinner.adminId} />;
  }
  return (
    <><PaymentOptionsFormView paymentOptions={paymentOptionsQuery.data} adminId={runningDinner.adminId} /></>
  );
}


function NewPaymentOptionsView({adminId}: BaseAdminIdProps) {

  const {t} = useTranslation(["admin", "common"]);

  const queryClient = useQueryClient();
  function handleCreate() {
    queryClient.setQueryData(['findPaymentOptions', adminId], newEmptyPaymentOptions());
  }

  return (
    <>
      <PageTitle>{t('admin:payment_options')}</PageTitle>
      <Paragraph i18n={"admin:payment_options_help"} />
      <Grid container justifyContent={"flex-start"} sx={{ mt: 3 }}>
        <Grid item>
          <PrimaryButton onClick={handleCreate} size="large">
            {t('admin:payment_options_create')}
          </PrimaryButton>
        </Grid>
      </Grid>
    </>
  );
}

type PaymentOptionsFormViewProps = {
  paymentOptions: PaymentOptions;
} & BaseAdminIdProps;

function PaymentOptionsFormView({paymentOptions, adminId}: PaymentOptionsFormViewProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {showSuccess} = useCustomSnackbar();
  const queryClient = useQueryClient();

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

  function updateQueryData(updatedPaymentOptions: PaymentOptions | null) {
    queryClient.setQueryData(['findPaymentOptions', adminId], updatedPaymentOptions);
  }

  async function savePaymentOptions(values: PaymentOptions) {
    const paymentOptionsToSave = {
      id: !isNewEntity(paymentOptions) ? paymentOptions.id : undefined,
      ...values
    };
    try {
      const updatedPaymentOptions = await createOrUpdatePaymentOptionsAsync(adminId, paymentOptionsToSave);
      showSuccess(t("admin:payment_options_save_success"));
      updateQueryData(updatedPaymentOptions);
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  async function deletePaymentOptions() {
    try {
      await deletePaymentOptionsAsync(adminId, paymentOptions.id!);
      showSuccess(t("admin:payment_options_delete_success"));
      updateQueryData(null);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }

  }

  const showDeleteBtn = !isNewEntity(paymentOptions);
  const sxPropsPrimaryBtn = showDeleteBtn ? commonStyles.buttonSpacingLeft : undefined;

  return (
    <>
      <PageTitle>{t('admin:payment_options')}</PageTitle>

      <Paragraph i18n={"admin:payment_options_edit_help"} />

      <FormProvider {...formMethods}>
        <form>

          <Grid container sx={{ mt: 3 }}>
            <Grid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             required
                             name="brandName"
                             label={t('common:brand_name')}/>
            </Grid>
          </Grid>

          <Grid container sx={{ my: 3 }}>
            <Grid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             required
                             name="pricePerRegistration"
                             helperText={"admin:price_per_registration_help"}
                             label={t('common:price_per_registration')}/>
            </Grid>
          </Grid>

          <Grid container sx={{ mt: 3 }}>
            <Grid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             name="agbLink"
                             helperText={t("admin:agb_link_help")}
                             label={t('admin:agb_link')}/>
            </Grid>
          </Grid>

          <Grid container sx={{ mt: 3 }}>
            <Grid item xs={12} md={4}>
              <FormTextField fullWidth
                             variant="outlined"
                             name="redirectAfterPurchaseLink"
                             helperText={t("admin:redirect_after_purchase_link_help")}
                             label={t('admin:redirect_after_purchase_link')}/>
            </Grid>
          </Grid>

          <Grid container justifyContent={"flex-start"} sx={{ mt: 3 }}>
            <Grid item xs={12} md={4}>
              { showDeleteBtn && <SecondaryButton onClick={deletePaymentOptions}>{t('common:delete')}</SecondaryButton> }
              <PrimaryButton onClick={handleSubmit(savePaymentOptions)} disabled={formState.isSubmitting} size={"large"} sx={sxPropsPrimaryBtn}>
                {t('common:save')}
              </PrimaryButton>
            </Grid>
          </Grid>

        </form>
      </FormProvider>
    </>
  );
}