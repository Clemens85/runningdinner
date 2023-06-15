import React, {useEffect, useState} from 'react';
import {
  Box, Button, Dialog, DialogContent, FormControl, FormControlLabel, FormHelperText, Grid, Radio,
  RadioGroup
} from "@material-ui/core";
import FormTextField from "../../../common/input/FormTextField";
import FormFieldset from "../../../common/theme/FormFieldset";
import {Trans, useTranslation} from "react-i18next";
import {Span} from '../../../common/theme/typography/Tags';
import {
  CallbackHandler,
  findRunningDinnerSessionDataByPublicId,
  isStringNotEmpty,
  RunningDinnerSessionData,
  TeamPartnerOption,
  useDisclosure
} from "@runningdinner/shared";
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import Paragraph from "../../../common/theme/typography/Paragraph";
import {SpacingGrid} from "../../../common/theme/SpacingGrid";
import SecondaryButton from "../../../common/theme/SecondaryButton";
import {TeamPartnerWishFormInput} from "./TeamPartnerWishFormInput";
import {Alert} from "@material-ui/lab";
import {Fetch} from "../../../common/Fetch";
import {useFormContext} from "react-hook-form";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";

export type TeamPartnerWishSectionRegistrationProps = {
  invitingParticipantEmail?: string;
  publicDinnerId: string
};

export function TeamPartnerWishSectionRegistration(props: TeamPartnerWishSectionRegistrationProps) {
  return <Fetch asyncFunction={findRunningDinnerSessionDataByPublicId}
                parameters={[props.publicDinnerId]}
                render={resultObj => <TeamPartnerWishSectionRegistrationView {...props} runningDinnerSessionData={resultObj.result} />} />
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
} & TeamPartnerOptionChangeCallback;

function ToggleTeamPartnerOptionsButton({currentTeamPartnerOption, runningDinnerSessionData, handleTeamPartnerOptionChange}: ToggleTeamPartnerOptionsButtonProps) {

  const {t} = useTranslation('common');

  const { isOpen: isDialogOpen, close: closeDialog, open: openDialog } = useDisclosure(false);

  const {showError} = useCustomSnackbar();

  const {watch} = useFormContext();
  const numSeatsCurrentValue = watch("numSeats");

  function handleToggleTeamPartnerOptionDialogClose(selectedTeamPartnerOption: TeamPartnerOption) {
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

  return (
    <>
      <SpacingGrid container justify={"flex-start"}>
        <SpacingGrid item>
          {currentTeamPartnerOption === TeamPartnerOption.NONE &&
            <SecondaryButton color={"primary"} variant={"outlined"} onClick={() => openDialog()}>{t("common:teampartner_wish_add")}...</SecondaryButton>
          }
          {currentTeamPartnerOption !== TeamPartnerOption.NONE &&
            <Box mb={1} mt={2}>
              <Button variant={"outlined"} onClick={() => handleToggleTeamPartnerOptionDialogClose(TeamPartnerOption.NONE)}>{t("common:teampartner_wish_option_remove")}</Button>
            </Box>
          }
        </SpacingGrid>
      </SpacingGrid>
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
    <Dialog onClose={onCancel} open={true}>
      <DialogTitleCloseable onClose={onCancel}>{t("common:teampartner_wish_add")}</DialogTitleCloseable>
      <DialogContent>
        <Grid item xs={12}>
          <FormControl component="fieldset">
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
        <SpacingGrid item xs={12} py={2}>
          <Span><Trans i18nKey={"common:teampartner_registration_info_address"} /></Span>
          <Span><Trans i18nKey={"common:teampartner_registration_info_no_duplicate"} /></Span>
          <Span><Trans i18nKey={"common:teampartner_registration_info_mealspecifics"} /></Span>
        </SpacingGrid>
      </Grid>
    </>
  )
}





