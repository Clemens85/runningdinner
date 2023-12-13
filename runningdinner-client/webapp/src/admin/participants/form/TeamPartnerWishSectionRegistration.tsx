import {useEffect, useState} from 'react';
import {
  Box, Button, Dialog, DialogContent, FormControl, FormControlLabel, FormHelperText, Grid, Radio,
  RadioGroup
} from "@mui/material";
import FormTextField from "../../../common/input/FormTextField";
import FormFieldset from "../../../common/theme/FormFieldset";
import {Trans, useTranslation} from "react-i18next";
import {Span} from '../../../common/theme/typography/Tags';
import {
  assertDefined,
  CallbackHandler,
  findRunningDinnerSessionDataByPublicId,
  isQuerySucceeded,
  isStringEmpty,
  isStringNotEmpty,
  RunningDinnerSessionData,
  TeamPartnerOption,
  useDisclosure
} from "@runningdinner/shared";
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import Paragraph from "../../../common/theme/typography/Paragraph";
import SecondaryButton from "../../../common/theme/SecondaryButton";
import {TeamPartnerWishFormInput} from "./TeamPartnerWishFormInput";
import { Alert } from '@mui/material';
import {useFormContext} from "react-hook-form";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import { useQuery } from '@tanstack/react-query';
import { FetchProgressBar } from '../../../common/FetchProgressBar';

export type TeamPartnerWishSectionRegistrationProps = {
  invitingParticipantEmail?: string;
  publicDinnerId: string
};

export function TeamPartnerWishSectionRegistration(props: TeamPartnerWishSectionRegistrationProps) {
  const findRunningDinnerSessionDataQuery = useQuery({
    queryKey: ["findRunningDinnerSessionData", props.publicDinnerId],
    queryFn: () => findRunningDinnerSessionDataByPublicId(props.publicDinnerId)
  });
  if (!isQuerySucceeded(findRunningDinnerSessionDataQuery)) {
    return <FetchProgressBar {...findRunningDinnerSessionDataQuery} />;
  }
  assertDefined(findRunningDinnerSessionDataQuery.data);
  return <TeamPartnerWishSectionRegistrationView {...props} runningDinnerSessionData={findRunningDinnerSessionDataQuery.data} />;
}

type TeamPartnerWishSectionRegistrationViewProps = {
  runningDinnerSessionData: RunningDinnerSessionData;
} & TeamPartnerWishSectionRegistrationProps;

function TeamPartnerWishSectionRegistrationView({invitingParticipantEmail, runningDinnerSessionData}: TeamPartnerWishSectionRegistrationViewProps) {

  const {t} = useTranslation(['common', 'landing']);

  const [teamPartnerOption, setTeamPartnerOption] = useState(TeamPartnerOption.NONE);

  const hasEmailInvitation = isStringNotEmpty(invitingParticipantEmail);

  useEffect(() => {
    if (hasEmailInvitation) {
      setTeamPartnerOption(TeamPartnerOption.INVITATION);
    }
  }, [hasEmailInvitation]);

  return (
    <Box mt={3}>
      <FormFieldset>{t('landing:teampartner_wish_section_title')}</FormFieldset>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          { teamPartnerOption === TeamPartnerOption.NONE &&
            <Box mb={2}>
              <Span i18n={"landing:teampartner_wish_section_subtitle"} />
            </Box> }
          { hasEmailInvitation &&
            <Box mb={3} mt={1}>
              <Alert severity={"success"} variant="outlined" data-testid={"email-invitation-info-box"}>
                {t("landing:teampartner_wish_invitation_info", { invitingParticipantEmail: invitingParticipantEmail })}
              </Alert>
            </Box>
          }
          { teamPartnerOption === TeamPartnerOption.INVITATION && <TeamPartnerWishFormInput teamPartnerWishHelperText={t('landing:team_partner_wish_help')} /> }
          { teamPartnerOption === TeamPartnerOption.REGISTRATION && <TeamPartnerRegistrationFormInput  /> }
          { !hasEmailInvitation &&
              <ToggleTeamPartnerOptionsButton currentTeamPartnerOption={teamPartnerOption}
                                              runningDinnerSessionData={runningDinnerSessionData}
                                              invitingParticipantEmail={invitingParticipantEmail}
                                              handleTeamPartnerOptionChange={newTeamPartnerOption => setTeamPartnerOption(newTeamPartnerOption)} />
          }
        </Grid>
      </Grid>
    </Box>
  );
}


type TeamPartnerOptionChangeCallback = {
  handleTeamPartnerOptionChange: (selection: TeamPartnerOption) => unknown;
}

type ToggleTeamPartnerOptionsButtonProps = {
  currentTeamPartnerOption: TeamPartnerOption;
  runningDinnerSessionData: RunningDinnerSessionData;
  invitingParticipantEmail?: string;
} & TeamPartnerOptionChangeCallback;

function ToggleTeamPartnerOptionsButton({currentTeamPartnerOption, runningDinnerSessionData, handleTeamPartnerOptionChange, invitingParticipantEmail}: ToggleTeamPartnerOptionsButtonProps) {

  const {t} = useTranslation('common');

  const { isOpen: isDialogOpen, close: closeDialog, open: openDialog } = useDisclosure(false);

  const {showError} = useCustomSnackbar();

  const {watch, setValue} = useFormContext();
  const numSeatsCurrentValue = watch("numSeats");

  function handleToggleTeamPartnerOptionDialogClose(selectedTeamPartnerOption: TeamPartnerOption) {
    resetTeamPartnerWish(selectedTeamPartnerOption);
    if (!selectedTeamPartnerOption) {
      return;
    }

    if (selectedTeamPartnerOption === TeamPartnerOption.REGISTRATION && (!numSeatsCurrentValue || numSeatsCurrentValue < runningDinnerSessionData.numSeatsNeededForHost)) {
      const errorMsg = <Trans i18nKey={"common:num_seats_teampartner_registration_invalid"} />;
      showError(errorMsg, {autoHideDuration: 13000, wrapInHtmlContainer: true} );
      return;
    }

    closeDialog();
    handleTeamPartnerOptionChange(selectedTeamPartnerOption);
  }

  function resetTeamPartnerWish(selectedTeamPartnerOption: TeamPartnerOption) {
    if (selectedTeamPartnerOption === TeamPartnerOption.REGISTRATION) {
      resetTeamPartnerWishEmail();
    } else if (selectedTeamPartnerOption === TeamPartnerOption.INVITATION) {
      resetTeamPartnerWishRegistrationData();
      resetTeamPartnerWishEmail(invitingParticipantEmail);
    } else {
      resetTeamPartnerWishEmail();
      resetTeamPartnerWishRegistrationData();
    }
  }

  function resetTeamPartnerWishEmail(mailToReset?: string) {
    const value = isStringEmpty(mailToReset) ? "" : mailToReset;
    setValue("teamPartnerWishEmail", value);
  }

  function resetTeamPartnerWishRegistrationData() {
    setValue("teamPartnerWishRegistrationData", undefined);
  }

  return (
    <>
      <Grid container justifyContent={"flex-start"}>
        <Grid item>
          {currentTeamPartnerOption === TeamPartnerOption.NONE &&
            <SecondaryButton color={"primary"} 
                             variant={"outlined"}
                             data-testid={"add-teampartner-wish-action"} 
                             onClick={() => openDialog()}>{t("common:teampartner_wish_add")}...</SecondaryButton>
          }
          {currentTeamPartnerOption !== TeamPartnerOption.NONE &&
            <Box mb={1} mt={2}>
              <Button variant={"outlined"} onClick={() => handleToggleTeamPartnerOptionDialogClose(TeamPartnerOption.NONE)}>{t("common:teampartner_wish_option_remove")}</Button>
            </Box>
          }
        </Grid>
      </Grid>
      { isDialogOpen && <AddTeamPartnerOptionsDialog onCancel={closeDialog}
                                                     handleTeamPartnerOptionChange={handleToggleTeamPartnerOptionDialogClose} /> }
    </>
  );
}

type AddTeamPartnerOptionsDialogCallback = {
  onCancel: CallbackHandler;
} & TeamPartnerOptionChangeCallback;

function AddTeamPartnerOptionsDialog({onCancel, handleTeamPartnerOptionChange}: AddTeamPartnerOptionsDialogCallback) {

  const {t} = useTranslation('common');

  const [teamPartnerOption, setTeamPartnerOption] = useState(TeamPartnerOption.REGISTRATION);

  function handleRadioChange(newVal: string) {
    setTeamPartnerOption(newVal as TeamPartnerOption);
  }

  return (
    <Dialog onClose={onCancel} open={true} data-testid="add-teampartner-wish-dialog">
      <DialogTitleCloseable onClose={onCancel}>{t("common:teampartner_wish_add")}</DialogTitleCloseable>
      <DialogContent>
        <Grid item xs={12}>
          <FormControl variant="standard" component="fieldset">
            <Box mb={1}><Paragraph>{t("common:teampartner_wish_options_label")}</Paragraph></Box>
            <RadioGroup aria-label={t("common:teampartner_wish_options_label")}
                        name="teamPartnerOption"
                        value={teamPartnerOption}
                        onChange={evt => handleRadioChange(evt.target.value)}>
              <Box my={1}>
                <FormControlLabel value={TeamPartnerOption.REGISTRATION}
                                  control={<Radio color={"primary"} />}
                                  label={t("common:teampartner_wish_options_registration")} />
                  <FormHelperText><Trans i18nKey={"common:teampartner_registration_info_1"}/></FormHelperText>
              </Box>
              <Box my={1}>
                <FormControlLabel value={TeamPartnerOption.INVITATION}
                                  control={<Radio color={"primary"} />}
                                  label={t("common:teampartner_wish_options_invitation")} />
                <FormHelperText>{t('landing:team_partner_wish_help')}</FormHelperText>
              </Box>
            </RadioGroup>
          </FormControl>
        </Grid>
      </DialogContent>
      <DialogActionsPanel onOk={() => handleTeamPartnerOptionChange(teamPartnerOption)}
                          onCancel={onCancel}
                          okLabel={t('common:ok')}
                          cancelLabel={t('common:cancel')}/>
    </Dialog>
  );
}

function TeamPartnerRegistrationFormInput() {

  const {t} = useTranslation('common');

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormTextField required
                         defaultValue={""}
                         fullWidth
                         variant="filled"
                         name="teamPartnerWishRegistrationData.firstnamePart"
                         label={t("common:teampartner_registration_firstname")} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormTextField required
                         defaultValue={""}
                         variant="filled"
                         fullWidth
                         name="teamPartnerWishRegistrationData.lastname"
                         label={t("common:teampartner_registration_lastname")}/>
        </Grid>
        <Grid item xs={12} sx={{py: 2}}>
          <Span><Trans i18nKey={"common:teampartner_registration_info_address"} /></Span>
          <Span><Trans i18nKey={"common:teampartner_registration_info_no_duplicate"} /></Span>
          <Span><Trans i18nKey={"common:teampartner_registration_info_mealspecifics"} /></Span>
        </Grid>
      </Grid>
    </>
  )
}





