import React, {useEffect, useState} from 'react'
import { Grid, Paper, Box, LinearProgress } from "@mui/material";
import ParticipantFormHeadline from "./ParticipantFormHeadline";
import {PersonalDataSection} from "./PersonalDataSection";
import AddressSection from "./AddressSection";
import MealSpecificsSection from "./MealSpecificsSection";
import MiscSection from "./MiscSection";
import {
  CallbackHandler,
  getFullname,
  HttpError,
  isNewEntity,
  isTeamPartnerWishChild,
  mapNullFieldsToEmptyStrings, newEmptyParticipantInstance, Participant, ParticipantList, ParticipantListable,
  saveParticipantAsync,
  useBackendIssueHandler
} from "@runningdinner/shared";
import {PrimaryButton} from "../../../common/theme/PrimaryButton";
import {DeleteParticipantDialog} from "../delete/DeleteParticipantDialog";
import {FormProvider, useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import SecondaryButton from "../../../common/theme/SecondaryButton";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import {TeamPartnerWishSectionAdmin} from "./TeamPartnerWishSectionAdmin";
import {commonStyles} from "../../../common/theme/CommonStyles";
import { ParticipantFormContextMenu } from './ParticipantFormContextMenu';

export interface ParticipantFormProps {
  participant: ParticipantListable;
  participantList: ParticipantList
  adminId: string;
  onParticipantSaved: CallbackHandler;
  onParticipantDeleted: CallbackHandler;
  teamPartnerWishDisabled: boolean;
}

// Validation, see: https://www.reactnativeschool.com/build-and-validate-forms-with-formik-and-yup/handling-server-errors
// and: https://github.com/jaredpalmer/formik/issues/150 and https://github.com/jaredpalmer/formik/issues/33
export default function ParticipantForm({participant, participantList, adminId, onParticipantSaved, onParticipantDeleted, teamPartnerWishDisabled}: ParticipantFormProps) {

  const {t} = useTranslation('common');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const {showSuccess} = useCustomSnackbar();

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const formMethods = useForm({
    defaultValues: newEmptyParticipantInstance(),
    // resolver: yupResolver(PARTICIPANT_VALIDATION_SCHEMA), // Currently I use only backend validation...
    mode: 'onTouched'
  });
  const { handleSubmit, clearErrors, setError, formState, reset } = formMethods;
  const { isSubmitting } = formState;

  const initValues = React.useCallback((participant: Participant) => {
    let participantToEdit = participant;
    if (!participantToEdit) {
      participantToEdit = newEmptyParticipantInstance();
    } else {
      participantToEdit = mapNullFieldsToEmptyStrings(participantToEdit, "teamPartnerWishRegistrationData", "teamPartnerWishOriginatorId");
    }
    reset(participantToEdit);
    clearErrors();
  }, [reset, clearErrors]);

  useEffect(() => {
    initValues(participant);
  }, [initValues, participant]);

  const showDeleteBtn = !!participant;

  const updateParticipant = async(values: Participant) => {
    const participantToSave = {
      id: !isNewEntity(participant) ?  participant.id : undefined,
      ...values
    };
    clearErrors();
    try {
      const savedParticipant = await saveParticipantAsync(adminId, participantToSave);
      showSuccess(t("admin:participant_save_success", { fullname: getFullname(savedParticipant) }));
      onParticipantSaved(savedParticipant);
    } catch(e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };

  function onDeleteDialogClosed(deletedParticipant: Participant | null) {
    setOpenDeleteDialog(false);
    if (deletedParticipant) {
      onParticipantDeleted(deletedParticipant);
    }
  }

  const teamPartnerWishChild = isTeamPartnerWishChild(participant);

  return (
    <Paper elevation={3}>
      <Box p={2}>
        <FormProvider {...formMethods}>
          <form>

            <Grid container justifyContent={"space-between"} alignItems={"baseline"}>
              <Grid item xs={12} md={8}>
                <ParticipantFormHeadline />
              </Grid>
              <Grid item xs={12} md={4} sx={ commonStyles.textAlignRight }>
                <ParticipantFormContextMenu participant={participant} 
                                            participantList={participantList}
                                            teamPartnerWishChild={teamPartnerWishChild}
                                            onParticipantsSwapped={() => onParticipantSaved(participant)} 
                                            adminId={adminId} />
              </Grid>
            </Grid>

            <Box mb={3} mt={3}>
              <PersonalDataSection showOnlyNameFields={teamPartnerWishChild} />
            </Box>
            { !teamPartnerWishChild &&
              <>
                <Box mb={3}>
                  <AddressSection isNumSeatsRequired={true} />
                </Box>
                <Box mb={3}>
                  <MealSpecificsSection />
                </Box>
              </>
            }
            <Box mb={3}>
              { !teamPartnerWishDisabled && <TeamPartnerWishSectionAdmin {...participant} adminId={adminId} /> }
            </Box>
            {!teamPartnerWishChild &&
              <Box mb={3}>
                <MiscSection/>
              </Box>
            }

            {isSubmitting && <LinearProgress />}

            <Grid container justifyContent={"flex-end"}>
              <Grid item>
                { showDeleteBtn && <SecondaryButton onClick={() => setOpenDeleteDialog(true)} data-testid={"delete-participant-dialog-action"}>{t('delete')}</SecondaryButton> }
                <PrimaryButton onClick={handleSubmit(updateParticipant)} disabled={isSubmitting} size={"large"} sx={commonStyles.buttonSpacingLeft}>
                  {t('save')}
                </PrimaryButton>
              </Grid>
            </Grid>

          </form>
        </FormProvider>

      </Box>

      { showDeleteBtn && <DeleteParticipantDialog open={openDeleteDialog}
                                                  adminId={adminId}
                                                  participant={participant}
                                                  onClose={onDeleteDialogClosed} /> }

    </Paper>
  );
}
