import React, {useEffect, useState} from 'react'
import {makeStyles, Grid, Paper, Box, LinearProgress } from "@material-ui/core";
import ParticipantFormHeadline from "./ParticipantFormHeadline";
import PersonalDataSection from "./PersonalDataSection";
import AddressSection from "./AddressSection";
import MealSpecificsSection from "./MealSpecificsSection";
import MiscSection from "./MiscSection";
import FillWithExampleDataLink from "./FillWithExampleDataLink";
import {
  getFullname,
  isNewEntity,
  mapNullFieldsToEmptyStrings, newEmptyParticipantInstance,
  PARTICIPANT_VALIDATION_SCHEMA, saveParticipantAsync
} from "@runningdinner/shared";
import {useSnackbar} from "notistack";
import {PrimaryButton} from "../../../common/theme/PrimaryButton";
import {DeleteParticipantDialog} from "../delete/DeleteParticipantDialog";
import {FormProvider, useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import SecondaryButton from "../../../common/theme/SecondaryButton";
import useHttpErrorHandler from "../../../common/HttpErrorHandlerHook";

const useStyles = makeStyles((theme) => ({
  buttonSpacingLeft: {
    marginLeft: theme.spacing(2)
  }
}));

// Validation, see: https://www.reactnativeschool.com/build-and-validate-forms-with-formik-and-yup/handling-server-errors
// and: https://github.com/jaredpalmer/formik/issues/150 and https://github.com/jaredpalmer/formik/issues/33
export default function ParticipantForm({participant, adminId, onParticipantSaved, onParticipantDeleted}) {

  const {t} = useTranslation('common');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const classes = useStyles();
  const {enqueueSnackbar} = useSnackbar();
  const { handleFormValidationErrors, validationErrors } = useHttpErrorHandler();

  const formMethods = useForm({
    defaultValues: newEmptyParticipantInstance(),
    validationSchema: PARTICIPANT_VALIDATION_SCHEMA,
    mode: 'onBlur'
  });
  const { handleSubmit, clearErrors, setError, formState, reset } = formMethods;
  const { isSubmitting } = formState;

  const initValues = React.useCallback(participant => {
    let participantToEdit = participant;
    if (!participantToEdit) {
      participantToEdit = newEmptyParticipantInstance();
    } else {
      participantToEdit = mapNullFieldsToEmptyStrings(participantToEdit, "assignmentType");
    }
    reset(participantToEdit);
    clearErrors();
  }, [reset, clearErrors]);

  useEffect(() => {
    initValues(participant);
  }, [initValues, participant]);

  const showDeleteBtn = !!participant;

  const updateParticipant = async(values) => {
    const participantToSave = {
      id: !isNewEntity(participant) ?  participant.id : null,
      ...values
    };
    clearErrors();
    try {
      const savedParticipant = await saveParticipantAsync(adminId, participantToSave);
      enqueueSnackbar(getFullname(savedParticipant) + " erfolgreich gespeichert", {variant: "success"});
      onParticipantSaved(savedParticipant);
    } catch(e) {
      handleFormValidationErrors(e);
      validationErrors.forEach(validationError => setError(validationError));
    }
  };

  function onDeleteDialogClosed(deletedParticipant) {
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
                  <FillWithExampleDataLink />
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
                  { showDeleteBtn && <SecondaryButton onClick={() => setOpenDeleteDialog(true)}>{t('delete')}</SecondaryButton> }
                  <PrimaryButton onClick={handleSubmit(updateParticipant)} disabled={isSubmitting} size={"large"} className={classes.buttonSpacingLeft}>
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
