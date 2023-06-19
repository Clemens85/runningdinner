import {
  Box,
  Dialog,
  DialogContent,
  Drawer,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Typography
} from "@material-ui/core";
import {
  CallbackHandler, CallbackHandlerAsync, hasTeamPartnerRegistrationData,
  isStringEmpty,
  isStringNotEmpty,
  newEmptyRegistrationDataInstance,
  performRegistration,
  performRegistrationValidation,
  RegistrationData,
  RegistrationSummary,
  TeamPartnerWishState,
  useBackendIssueHandler,
  useDisclosure,
  useMealSpecificsStringify,
  ValueTranslate
} from "@runningdinner/shared";
import {Trans, useTranslation} from "react-i18next";
import useCommonStyles from "../common/theme/CommonStyles";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import {FormProvider, useForm} from "react-hook-form";
import {Span, Subtitle} from "../common/theme/typography/Tags";
import {PersonalDataSection} from "../admin/participants/form/PersonalDataSection";
import AddressSection from "../admin/participants/form/AddressSection";
import MealSpecificsSection from "../admin/participants/form/MealSpecificsSection";
import MiscSection from "../admin/participants/form/MiscSection";
import SecondaryButton from "../common/theme/SecondaryButton";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import React from "react";
import FormCheckbox from "../common/input/FormCheckbox";
import LinkExtern from "../common/theme/LinkExtern";
import {IMPRESSUM_PATH} from "../common/mainnavigation/NavigationPaths";
import {DialogTitleCloseable} from "../common/theme/DialogTitleCloseable";
import DialogActionsPanel from "../common/theme/DialogActionsPanel";
import Paragraph from "../common/theme/typography/Paragraph";
import MailIcon from '@material-ui/icons/Mail';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import DoneIcon from '@material-ui/icons/Done';
import { useQuery } from "../common/hooks/QueryHook";
import { getDecodedQueryParam } from "../common/QueryParamDecoder";
import { Alert, AlertTitle } from "@material-ui/lab";
import {TeamPartnerWishSectionRegistration} from "../admin/participants/form/TeamPartnerWishSectionRegistration";


const drawerWidth = "1024px";

const useDrawerStyles = makeStyles((theme) => ({
  drawer: {
    maxWidth: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    maxWidth: drawerWidth,
  }
}));


export interface PublicDinnerEventRegistrationFormProps {
  onCancel: CallbackHandler;
  onRegistrationPerformed: (registrationData: RegistrationData) => unknown;
  publicDinnerId: string;
  teamPartnerWishDisabled: boolean;
}

interface RegistrationDataCollection {
  registrationData: RegistrationData;
  registrationSummary: RegistrationSummary;
}

export function PublicDinnerEventRegistrationForm({onCancel, onRegistrationPerformed, publicDinnerId, teamPartnerWishDisabled}: PublicDinnerEventRegistrationFormProps) {

  const {t} = useTranslation(['landing', 'common']);

  const classes = useCommonStyles();
  const drawerClasses = useDrawerStyles();
  const query = useQuery();

  const { isOpen: isRegistrationSummaryOpen,
          open: openRegistrationSummary,
          close: closeRegistrationSummary,
          getIsOpenData: getRegistrationDataCollection } = useDisclosure<RegistrationDataCollection>();

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
  const {handleSubmit, clearErrors, setError, formState} = formMethods;
  const {isSubmitting} = formState;

  const submitRegistrationData = async (values: RegistrationData) => {
    const registrationData = { ...values };
    clearErrors();
    try {
      const registrationSummary = await performRegistrationValidation(publicDinnerId, registrationData);
      openRegistrationSummary({registrationSummary, registrationData});
    } catch (e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
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
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
    }
  }

  return (
    <>
      <Drawer open={true}
              anchor="right"
              className={drawerClasses.drawer}
              onClose={onCancel}
              classes={{
                paper: drawerClasses.drawerPaper,
              }}
              ModalProps={{keepMounted: true}}>
        <div>
          <Paper elevation={3}>
            <Box p={3}>
              <FormProvider {...formMethods}>
                <form>
                  <Grid container justify={"space-between"} alignItems={"baseline"}>
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

                  <Grid container justify={"flex-end"}>
                    <Grid item>
                      <SecondaryButton onClick={onCancel}>{t('common:cancel')}</SecondaryButton>
                      <PrimaryButton onClick={handleSubmit(submitRegistrationData)}
                                     disabled={isSubmitting}
                                     data-testid={"registration-form-next-action"}
                                     size={"large"}
                                     className={classes.buttonSpacingLeft}>
                        {t('common:next')}
                      </PrimaryButton>
                    </Grid>
                  </Grid>

                </form>
              </FormProvider>

            </Box>
          </Paper>
        </div>
      </Drawer>
      { isRegistrationSummaryOpen && <RegistrationSummaryDialog { ...getRegistrationDataCollection() }
                                                                onCancel={closeRegistrationSummary}
                                                                onPerformRegistration={handlePerformRegistration} /> }
    </>
  );
}


interface RegistrationSummaryDialogProps {
  registrationSummary: RegistrationSummary;
  onCancel: CallbackHandler;
  onPerformRegistration: CallbackHandlerAsync;
}

function RegistrationSummaryDialog({registrationSummary, onCancel, onPerformRegistration}: RegistrationSummaryDialogProps) {

  const {t} = useTranslation(["landing", "common"]);

  const showNotEnoughSeatsMessage = isStringEmpty(registrationSummary.teamPartnerWishEmail) && !registrationSummary.canHost;

  const mealSpecificsAsString = useMealSpecificsStringify(registrationSummary?.mealSpecifics);

  return (
    <Dialog onClose={onCancel} open={true} data-testid={"registration-summary-dialog"}>
      <DialogTitleCloseable onClose={onCancel}>{t('landing:registration_finish')}</DialogTitleCloseable>
      <DialogContent>
        <Subtitle i18n={"landing:registration_finish_check"} />
        <Box mb={2}>
          <Span>{registrationSummary.fullname}</Span>
          <Span>{registrationSummary.streetWithNr}</Span>
          <Span>{registrationSummary.zipWithCity}</Span>
          { isStringNotEmpty(registrationSummary.addressRemarks) && <Span><em>{registrationSummary.addressRemarks}</em></Span> }
        </Box>
        <Box mb={2}>
          <div style={{ display: 'flex' }}>
            <MailIcon color={"primary"} />
            <Typography variant={"body1"} component="p" noWrap>&nbsp; {registrationSummary.email}</Typography>
          </div>
          { isStringNotEmpty(registrationSummary.mobile) &&
              <div style={{ display: 'flex', marginTop: '10px' }}>
                <PhoneAndroidIcon color={"primary"} />
                <Paragraph>&nbsp; {registrationSummary.mobile}</Paragraph>
              </div>
          }
        </Box>
        <Box mb={2}>
          { registrationSummary.canHost &&
              <div style={{display: 'flex'}}>
                <DoneIcon color={"primary"}/>
                <Span>&nbsp; {t("landing:registration_can_host")} ({t("common:participant_seats", {numSeats: registrationSummary.numberOfSeats})})</Span>
              </div>
          }
          { showNotEnoughSeatsMessage &&
            <Span>{t("landing:registration_no_host")} ({t("common:participant_seats", {numSeats: registrationSummary.numberOfSeats})})</Span>
          }
        </Box>

        <Box mb={2}>
          <Span>{t('common:gender')}: <ValueTranslate value={registrationSummary.gender} ns="common" prefix="gender" valueMapping={{'undefined': 'unknown'}}/></Span>
          { registrationSummary.ageSpecified && <Span>{t('common:age')}: {registrationSummary.age}</Span> }
          { !registrationSummary.ageSpecified && <Span>{t('common:age')}: {t('landing:gender_unknown')}</Span> }
          { isStringNotEmpty(registrationSummary.notes) && <Span><em>{registrationSummary.notes}</em></Span> }

          { isStringNotEmpty(mealSpecificsAsString) && registrationSummary.mealSpecifics &&
            <Box>
              <Span>{t("mealspecifics_summary_text")}: {mealSpecificsAsString}</Span>
              { isStringNotEmpty(registrationSummary.mealSpecifics.mealSpecificsNote) && <Span><em>{registrationSummary.mealSpecifics.mealSpecificsNote}</em></Span> }
            </Box>
          }
        </Box>

        { isStringNotEmpty(registrationSummary.teamPartnerWishEmail) &&
          <Box mb={2}>
            { !registrationSummary.teamPartnerWishEmail &&
              <Span noWrap={true}>
                <Trans i18nKey={"landing:teampartner_wish_summary"}
                       components={{ italic: <em /> }}
                       values={{ teamPartnerWish: registrationSummary.teamPartnerWishEmail }} />
              </Span> }
            { registrationSummary.teamPartnerWishState === TeamPartnerWishState.EXISTS_SAME_TEAM_PARTNER_WISH &&
              <Span noWrap={true}>
                <Trans i18nKey={"landing:teampartner_wish_summary_match"}
                       components={{ italic: <em /> }}
                       values={{ teamPartnerWish: registrationSummary.teamPartnerWishEmail }} />
              </Span> }
            { registrationSummary.teamPartnerWishState === TeamPartnerWishState.NOT_EXISTING &&
              <Span noWrap={true}><Trans i18nKey={"landing:teampartner_wish_summary_not_existing"}
                           components={{ italic: <em /> }}
                           values={{ teamPartnerWish: registrationSummary.teamPartnerWishEmail }} />
              </Span> }
          </Box>
        }

        { hasTeamPartnerRegistrationData(registrationSummary.teamPartnerWishRegistrationData) &&
          <Box mb={2}>
            <Span noWrap={true}>
              <Trans i18nKey={"landing:teampartner_registration_summary_info"}
                     components={{ italic: <em /> }}
                     values={{ firstname: registrationSummary.teamPartnerWishRegistrationData?.firstnamePart,
                               lastname: registrationSummary.teamPartnerWishRegistrationData?.lastname }} />
            </Span>
          </Box>
        }

        { isStringEmpty(registrationSummary.mobile) && 
            <Alert severity={"info"} data-testid={"mobilenumber-missing-attention"}>
              <AlertTitle>{t('common:attention')}</AlertTitle>
              {t('landing:attention_mobilenumber_missing')}
            </Alert>
        }


      </DialogContent>
      <DialogActionsPanel onOk={onPerformRegistration} onCancel={onCancel}
                          okLabel={t('landing:registration_perform')}
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}