import React, {useState} from 'react';
import {DialogTitleCloseable} from "../common/theme/DialogTitleCloseable";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import {
  DialogContent,
  Dialog,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardActions
} from "@material-ui/core";
import {
  BasePublicDinnerProps,
  CallbackHandler,
  createRegistrationOrder, isStringNotEmpty, LocalDate,
  RegistrationDataCollection,
} from "@runningdinner/shared";
import {Trans, useTranslation} from "react-i18next";
import Paragraph from "../common/theme/typography/Paragraph";
import {usePaymentStyles} from "./LandingStyles";
import paypalLogo from "./images/paypal-logo.png";
import LinkExtern from "../common/theme/LinkExtern";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {useCustomSnackbar} from "../common/theme/CustomSnackbarHook";

type RegistrationPaymentDialogProps = {
  onCancel: CallbackHandler;
  registrationDataCollection: RegistrationDataCollection;
} & BasePublicDinnerProps;


export function RegistrationPaymentDialog({onCancel, registrationDataCollection, publicRunningDinner}: RegistrationPaymentDialogProps) {

  const {t} = useTranslation(["landing", "common"]);
  const {showError} = useCustomSnackbar();
  const classes = usePaymentStyles();

  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);

  const {registrationData, registrationSummary} = registrationDataCollection;
  const {registrationPaymentSummary} = registrationSummary;

  if (!registrationPaymentSummary) {
    return null;
  }

  const registrationType = registrationPaymentSummary.teamPartnerRegistration ? t("landing:payment_teampartner_registrataion") : "";
  const totalPriceFormatted = t("landing:payment_total_price", { totalPriceFormatted: registrationPaymentSummary.totalPriceFormatted });

  async function handleCreateOrder() {
    setOrderProcessing(true);
    try {
      const publicDinnerId = publicRunningDinner.publicSettings.publicDinnerId;
      const registrationOrder = await createRegistrationOrder(publicDinnerId, registrationData);
      const {approveLink} = registrationOrder;
      window.location.href = approveLink.href;
    } catch (e) {
      showError(t("landing:registration_payment_error"));
    } finally {
      setOrderProcessing(false);
    }
  }

  function renderSubHeader() {
    return (
      <>{publicRunningDinner.city} {t("common:on_date")} <LocalDate date={publicRunningDinner.date}/></>
    );
  }

  return (
    <Dialog onClose={onCancel} open={true}>
      <DialogTitleCloseable onClose={onCancel}>{t('landing:payment_finalize')}</DialogTitleCloseable>
      <DialogContent>

        <Paragraph><Trans i18nKey={"landing:registration_payment_info"} /></Paragraph>

        <SpacingGrid container my={3}>
          <SpacingGrid item xs={12}>
            <Card>
              <CardHeader
                title={publicRunningDinner.publicSettings.title}
                subheader={renderSubHeader()}
                subheaderTypographyProps={{ align: 'center' }}
                titleTypographyProps={{ align: 'center' }}
                className={classes.cardHeader}
              />
              <CardContent>
                <div className={classes.cardPricing}>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    { totalPriceFormatted }
                  </Typography>
                </div>
                <ul className={classes.cardList}>
                  <Typography component="li" variant="subtitle1" align="center">{t("common:organizer")}: {registrationPaymentSummary.brandName}</Typography>
                  <Typography component="li" variant="subtitle1" align="center">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span>{t("landing:payment_with_paypal")}</span>
                      <img src={paypalLogo} alt="PayPal" loading="lazy" width={48} height={48} />
                    </div>
                  </Typography>
                  { registrationPaymentSummary.teamPartnerRegistration &&
                    <Typography component="li" variant="subtitle1" align="center">
                      { registrationType }: 2 x {registrationPaymentSummary.pricePerRegistrationFormatted} €
                    </Typography>
                  }
                  <Typography component="li" variant="subtitle1" align="center">{t("landing:payment_check_contact_data")}:</Typography>
                  <Typography component="li" variant="subtitle1" align="center"><strong>{registrationData.email}</strong></Typography>
                    { isStringNotEmpty(registrationData.mobileNumber) &&
                      <Typography component="li" variant="subtitle1" align="center"><strong>{registrationData.mobileNumber}</strong></Typography>
                    }
                </ul>
              </CardContent>
              <CardActions>
                <PrimaryButton disabled={orderProcessing} size={"large"} fullWidth onClick={handleCreateOrder}>{t("landing:payment_purchase_now")}</PrimaryButton>
              </CardActions>
            </Card>
          </SpacingGrid>

          <SpacingGrid item pt={2}>
            <Typography variant={"caption"}>
              <cite>
                <Trans i18nKey={"landing:payment_no_paypal_contact"}
                        // @ts-ignore
                        components={{ anchor: <LinkExtern /> }}
                        values={{ publicContactEmail: publicRunningDinner.publicSettings.publicContactEmail }} />
              </cite>
            </Typography>
          </SpacingGrid>

        </SpacingGrid>


      </DialogContent>
    </Dialog>
  );
}
