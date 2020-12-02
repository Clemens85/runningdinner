import React, {useEffect, useState} from 'react'
import {makeStyles, Grid, Paper, Box, LinearProgress } from "@material-ui/core";
import ParticipantFormHeadline from "./ParticipantFormHeadline";
import ParticipantService from "../../../shared/admin/ParticipantService";
import PersonalDataSection from "./PersonalDataSection";
import AddressSection from "./AddressSection";
import MealSpecificsSection from "./MealSpecificsSection";
import MiscSection from "./MiscSection";
import {PARTICIPANT_VALIDATION_SCHEMA} from "../../../shared/admin/ValidationSchemas";
import FillWithExampleDataLink from "./FillWithExampleDataLink";
import {
  isNewEntity,
  mapNullFieldsToEmptyStrings
} from "../../../shared/Utils";
import {useSnackbar} from "notistack";
import {PrimaryButton} from "../../../common/theme/PrimaryButton";
import {DeleteParticipantDialog} from "../delete/DeleteParticipantDialog";
import {FormContext, useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import SecondaryButton from "../../../common/theme/SecondaryButton";
import useHttpErrorHandler from "common/HttpErrorHandlerHook";

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
    defaultValues: ParticipantService.newEmptyParticipantInstance(),
    validationSchema: PARTICIPANT_VALIDATION_SCHEMA,
    mode: 'onBlur'
  });
  const { handleSubmit, clearError, setError, formState, reset } = formMethods;
  const { isSubmitting } = formState;

  const initValues = React.useCallback(participant => {
    let participantToEdit = participant;
    if (!participantToEdit) {
      participantToEdit = ParticipantService.newEmptyParticipantInstance();
    } else {
      participantToEdit = mapNullFieldsToEmptyStrings(participantToEdit, "assignmentType");
    }
    reset(participantToEdit);
    clearError();
  }, [reset, clearError]);

  useEffect(() => {
    initValues(participant);
  }, [initValues, participant]);

  const showDeleteBtn = !!participant;

  const updateParticipant = async(values) => {
    const participantToSave = {
      id: !isNewEntity(participant) ?  participant.id : null,
      ...values
    };
    console.log(`Updating ${JSON.stringify(participantToSave)}`);
    clearError();
    try {
      const savedParticipant = await ParticipantService.saveParticipantAsync(adminId, participantToSave);
      enqueueSnackbar(ParticipantService.getFullname(savedParticipant) + " erfolgreich gespeichert", {variant: "success"});
      onParticipantSaved(savedParticipant);
    } catch(e) {
      handleFormValidationErrors(e);
      setError(validationErrors);
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
          <FormContext {...formMethods}>
            <form>

              <Grid container justify={"space-between"} alignItems={"baseline"}>
                <Grid item xs={12} md={8}>
                  <ParticipantFormHeadline></ParticipantFormHeadline>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FillWithExampleDataLink></FillWithExampleDataLink>
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
          </FormContext>

        </Box>

        { showDeleteBtn && <DeleteParticipantDialog open={openDeleteDialog}
                                                    adminId={adminId}
                                                    participant={participant}
                                                    onClose={onDeleteDialogClosed} /> }

      </Paper>
  );
}
