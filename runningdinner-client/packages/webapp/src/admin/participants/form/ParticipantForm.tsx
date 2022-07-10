import React, {useEffect, useState} from 'react'
import { Grid, Paper, Box, LinearProgress } from "@material-ui/core";
import ParticipantFormHeadline from "./ParticipantFormHeadline";
import PersonalDataSection from "./PersonalDataSection";
import AddressSection from "./AddressSection";
import MealSpecificsSection from "./MealSpecificsSection";
import MiscSection from "./MiscSection";
import FillWithExampleDataLink from "./FillWithExampleDataLink";
import {
  CallbackHandler,
  getFullname,
  isNewEntity,
  mapNullFieldsToEmptyStrings, newEmptyParticipantInstance, Participant,
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
import useCommonStyles from "../../../common/theme/CommonStyles";

export interface ParticipantFormProps {
  participant: Participant;
  adminId: string;
  onParticipantSaved: CallbackHandler;
  onParticipantDeleted: CallbackHandler
}

// Validation, see: https://www.reactnativeschool.com/build-and-validate-forms-with-formik-and-yup/handling-server-errors
// and: https://github.com/jaredpalmer/formik/issues/150 and https://github.com/jaredpalmer/formik/issues/33
export default function ParticipantForm({participant, adminId, onParticipantSaved, onParticipantDeleted}: ParticipantFormProps) {

  const {t} = useTranslation('common');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const classes = useCommonStyles();
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

  const initValues = React.useCallback(participant => {
    let participantToEdit = participant;
    if (!participantToEdit) {
      participantToEdit = newEmptyParticipantInstance();
    } else {
      participantToEdit = mapNullFieldsToEmptyStrings(participantToEdit);
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
      showSuccess(getFullname(savedParticipant) + " erfolgreich gespeichert");
      onParticipantSaved(savedParticipant);
    } catch(e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
    }
  };

  function onDeleteDialogClosed(deletedParticipant: Participant) {
    setOpenDeleteDialog(false);
    if (deletedParticipant) {
      onParticipantDeleted(deletedParticipant);
    }
  }

  return (
      <Paper elevation={3}>
        <Box p={2}>
          <FormProvider {...formMethods}>
            <form>

              <Grid container justify={"space-between"} alignItems={"baseline"}>
                <Grid item xs={12} md={8}>
                  <ParticipantFormHeadline />
                </Grid>
                <Grid item xs={12} md={4}>
                  <div className={classes.textAlignRight}>
                    <FillWithExampleDataLink />
                  </div>
                </Grid>
              </Grid>

              <Box mb={3} mt={3}>
                <PersonalDataSection />
              </Box>
              <Box mb={3}>
                <AddressSection />
              </Box>
              <Box mb={3}>
                <MealSpecificsSection />
              </Box>
              <Box mb={3}>
                <MiscSection />
              </Box>

              {isSubmitting && <LinearProgress />}

              <Grid container justify={"flex-end"}>
                <Grid item>
                  { showDeleteBtn && <SecondaryButton onClick={() => setOpenDeleteDialog(true)} data-testid={"delete-participant-dialog-action"}>{t('delete')}</SecondaryButton> }
                  <PrimaryButton onClick={handleSubmit(updateParticipant)} disabled={isSubmitting} size={"large"}
                                 className={classes.buttonSpacingLeft}>
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
