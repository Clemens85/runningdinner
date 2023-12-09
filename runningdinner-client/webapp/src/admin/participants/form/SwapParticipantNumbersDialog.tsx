import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import {Box, Dialog, DialogActions, DialogContent, Alert, Autocomplete, TextField, UseAutocompleteProps} from "@mui/material";
import {BaseAdminIdProps, CallbackHandler, concatParticipantList, findEntityById, getFullname, HttpError, 
        isStringNotEmpty, Participant, ParticipantList, ParticipantListable, removeEntityFromList, swapParticipantNumbersAsync, 
        useBackendIssueHandler,  useFindParticipantsListMandatory} from "@runningdinner/shared";
import { useMemo, useState } from "react";
import {Trans, useTranslation} from "react-i18next";
import Paragraph from "../../../common/theme/typography/Paragraph";
import LinkIntern from "../../../common/theme/LinkIntern";
import { DefaultDialogCancelButton, DialogActionsButtons } from "../../../common/theme/dialog/DialogActionsButtons";
import { PrimarySuccessButtonAsync } from "../../../common/theme/PrimarySuccessButtonAsync";
import { useCustomSnackbar } from "../../../common/theme/CustomSnackbarHook";
import { useAdminNavigation } from "../../AdminNavigationHook";
import { useNotificationHttpError } from "../../../common/NotificationHttpErrorHook";


interface SelectParticiantToSwitchProps extends BaseAdminIdProps {
  srcParticipant: Participant,
  // @ts-ignore
  selectedParticipant: UseAutocompleteProps | null;
    // @ts-ignore
  onSelectedParticipantChange: (newVal: UseAutocompleteProps | null) => unknown;
}

interface SwitchParticipantNumbersDialogProps extends BaseAdminIdProps {
  srcParticipant: Participant,
  onCancel: CallbackHandler;
  onParticipantsSwapped: CallbackHandler
};

function ExistingTeamInfoMessage({adminId}: BaseAdminIdProps) {

  const {generateDropTeamsPath} = useAdminNavigation();

  return (
    <Trans i18nKey="admin:participants_swap_number_teams_existing_info"
           // @ts-ignore
           components={{ anchor: <LinkIntern pathname={generateDropTeamsPath(adminId)} /> }} /> 
  )
}


function HasTeamAlert({adminId}: BaseAdminIdProps) {

  return (
    <Alert severity="info" variant="outlined">
      <ExistingTeamInfoMessage adminId={adminId} />
    </Alert>
  )
}

function getParticipantSelectionOptions(srcParticipant: Participant, participantList: ParticipantList) {
  let allParticipants = concatParticipantList(participantList);
  allParticipants = removeEntityFromList(allParticipants, srcParticipant as ParticipantListable)!;
  return allParticipants.map(p => {
    return {
      label: getFullname(p),
      id: p.id
    }
  });
}

function SelectParticiantToSwitch({adminId, srcParticipant, selectedParticipant, onSelectedParticipantChange}: SelectParticiantToSwitchProps) {

  const {t} = useTranslation(["admin", "common"]);

  const participantList = useFindParticipantsListMandatory(adminId);

  const participantOptions = useMemo(
    () => getParticipantSelectionOptions(srcParticipant, participantList),
    [participantList, srcParticipant]
  );

  return (
    <>
      <Box mb={3}>
        <Paragraph><Trans i18nKey="admin:participants_swap_number_choose_text" values={{fullname: getFullname(srcParticipant) }}/></Paragraph><br/>
        <Paragraph><ExistingTeamInfoMessage adminId={adminId} /></Paragraph><br/>
        <Paragraph><Trans i18nKey="admin:participants_swap_number_note_waitinglist" /></Paragraph>
      </Box>

      <Autocomplete
        options={participantOptions}
        value={selectedParticipant}
        onChange={(_evt, newValue) => { onSelectedParticipantChange(newValue) }}
        sx={{ minWidth: 300, maxWidth: 500 }}
        renderInput={(params) => <TextField {...params} label={t("admin:participant_choose")} autoFocus={true} />}
      />

    </>
  )
}

export function SwapParticipantNumbersDialog({onCancel, onParticipantsSwapped, srcParticipant, adminId}: SwitchParticipantNumbersDialogProps) {

  const {t} = useTranslation(["admin", "common"]);

  const {showSuccess, showError} = useCustomSnackbar();

  const participantList = useFindParticipantsListMandatory(adminId);

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const hasTeam = isStringNotEmpty(srcParticipant.teamId);
  const fullname = getFullname(srcParticipant);

  // @ts-ignore
  const [selectedParticipant, setSelectedParticipant] = useState<UseAutocompleteProps | null>(null);

  const handleSwapParticipantNumbers = async () => {
    if (!selectedParticipant) {
      return;
    }
    let allParticipants = concatParticipantList(participantList);
    const selectedParticipantForSwap = findEntityById(allParticipants, selectedParticipant.id);
    if (isStringNotEmpty(selectedParticipantForSwap.teamId)) {
      showError(t("admin:participants_swap_number_teams_existing_error"));
      return;
    }
    try {
      await swapParticipantNumbersAsync(adminId, srcParticipant.id!, selectedParticipantForSwap.id);
      showSuccess(t("admin:participants_swap_success"));
      onParticipantsSwapped();
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };

  const okButton = <PrimarySuccessButtonAsync disabled={hasTeam || !selectedParticipant} 
                                              onClick={handleSwapParticipantNumbers}>
                                                {t("admin:participants_swap_number")}
                   </PrimarySuccessButtonAsync>;

  return (
    <Dialog open={true} onClose={onCancel} fullWidth={true}>
      <DialogTitleCloseable onClose={onCancel}>{t('admin:participants_swap_number_from', {fullname: fullname})}</DialogTitleCloseable>
      <DialogContent>
        <Box>
          { hasTeam && <HasTeamAlert adminId={adminId}/> }
          { !hasTeam && <SelectParticiantToSwitch srcParticipant={srcParticipant} 
                                                  adminId={adminId}
                                                  selectedParticipant={selectedParticipant}
                                                  onSelectedParticipantChange={setSelectedParticipant}  /> }
        </Box>
      </DialogContent>
      <DialogActions>
        <DialogActionsButtons okButton={okButton} 
                              cancelButton={<DefaultDialogCancelButton onCancel={onCancel} cancelLabel={t("common:cancel")} />} />
      </DialogActions>
    </Dialog>
  );
}