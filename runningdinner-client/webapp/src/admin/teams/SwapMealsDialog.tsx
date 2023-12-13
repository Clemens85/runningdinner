import { Autocomplete, Box, Dialog, DialogActions, DialogContent, TextField, Theme, UseAutocompleteProps, useMediaQuery} from "@mui/material";
import { DialogTitleCloseable } from "../../common/theme/DialogTitleCloseable";
import { DialogActionsButtons, DefaultDialogCancelButton } from "../../common/theme/dialog/DialogActionsButtons";
import { BaseAdminIdProps, HttpError, Team, TeamArrangementList, TeamStatus, assertDefined, findEntityById, getFullnameList, isSameEntity, removeEntityFromList, swapMealsAsync, useBackendIssueHandler, useFindTeams, useTeamName, useTeamNameMembers } from "@runningdinner/shared";
import { Trans, useTranslation } from "react-i18next";
import Paragraph from "../../common/theme/typography/Paragraph";
import { useMemo, useState } from "react";
import { PrimarySuccessButtonAsync } from "../../common/theme/PrimarySuccessButtonAsync";
import { useNotificationHttpError } from "../../common/NotificationHttpErrorHook";

interface SelectTeamToSwapProps {
  allTeams: Team[];
  srcTeam: Team;
  // @ts-ignore
  selectedTeam: UseAutocompleteProps | null;
    // @ts-ignore
  onSelectedTeamChange: (newVal: UseAutocompleteProps | null) => unknown;
}

function SelectTeamToSwap({allTeams, srcTeam, selectedTeam, onSelectedTeamChange}: SelectTeamToSwapProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {getTeamNameMembers} = useTeamNameMembers();

  const smDownDevice = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const getTeamSelectionOptions = (allTeams: Team[], srcTeam: Team) => {
    let result = removeEntityFromList(allTeams, srcTeam)!;
    return result
            .filter(t => t.status !== TeamStatus.CANCELLED)
            .filter(t => !isSameEntity(t.meal, srcTeam.meal))
            .map(t => {
                  return {
                    label: `${t.meal.label} - ${getTeamNameMembers(t)}`,
                    id: t.id
                  } 
            });
  };

  const teamOptions = useMemo(
    () => getTeamSelectionOptions(allTeams, srcTeam),
    [allTeams, srcTeam]
  );

  const minWidth = smDownDevice ? 250 : 400;

  return (
    <>
      <Autocomplete
        options={teamOptions}
        value={selectedTeam}
        onChange={(_evt, newValue) => { onSelectedTeamChange(newValue) }}
        sx={{ minWidth: minWidth }}
        renderInput={(params) => <TextField {...params} label={t("admin:meals_swap_team_team_choose")} autoFocus={true} />}
      />
    </>
  )
}
interface SwapMealsDialogProps extends BaseAdminIdProps {
  srcTeam: Team;
  onClose: (updatedTeams?: TeamArrangementList) => unknown;
}

export function SwapMealsDialog({srcTeam, adminId, onClose}: SwapMealsDialogProps) {

  const {t} = useTranslation(["admin", "common"]);
  const {getTeamName} = useTeamName();
  const {getTeamNameMembers} = useTeamNameMembers();

  const {data: allTeams} = useFindTeams(adminId);
  assertDefined(allTeams);
  
  // @ts-ignore
  const [selectedTeam, setSelectedTeam] = useState<UseAutocompleteProps | null>(null);
  const smDownDevice = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  // @ts-ignore
  function getSelectedTeam(selectedTeam: UseAutocompleteProps): Team {
    const result = findEntityById(allTeams, selectedTeam.id)!;
    return result;
  }

  const handleCancel = () => {
    onClose();
  }

  const handleSwapMeal = async () => {
    if (!selectedTeam) {
      return;
    }
    try {
      const updatedTeams = await swapMealsAsync(adminId, srcTeam.id!, selectedTeam.id);
      onClose(updatedTeams);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };

  const okButton = <PrimarySuccessButtonAsync disabled={!selectedTeam} 
                                              onClick={handleSwapMeal}>
                                                {t("admin:meals_swap")}
                   </PrimarySuccessButtonAsync>;

  const dialogTitle = smDownDevice ? t("admin:meals_swap"): t("admin:meals_swap_team", { team: getTeamName(srcTeam) });

  return (
    <Dialog open={true} onClose={handleCancel} fullWidth={true}>
      <DialogTitleCloseable onClose={handleCancel}>{dialogTitle}</DialogTitleCloseable>
      <DialogContent>
        <Box mb={2}>
          <Paragraph><Trans i18nKey="admin:meals_swap_team_description" 
                            values={{ team: getTeamNameMembers(srcTeam), meal: srcTeam.meal.label  }}/></Paragraph><br/>
        </Box>
        <Box>
          <SelectTeamToSwap srcTeam={srcTeam} 
                            allTeams={allTeams} 
                            selectedTeam={selectedTeam}
                            onSelectedTeamChange={setSelectedTeam}  /> 
        </Box>
        { selectedTeam && 
          <Box mt={4}>
            <Paragraph><Trans i18nKey="admin:meals_swap_team_after_swap_src" 
                              values={{ 
                                team: getFullnameList(srcTeam.teamMembers), 
                                meal: getSelectedTeam(selectedTeam).meal.label, 
                                newTeamNumber: getSelectedTeam(selectedTeam).teamNumber }}/></Paragraph>
            <br />
            <Paragraph><Trans i18nKey="admin:meals_swap_team_after_swap_selected" 
                              values={{ 
                                team: getFullnameList(getSelectedTeam(selectedTeam).teamMembers), 
                                meal: srcTeam.meal.label,
                                newTeamNumber: srcTeam.teamNumber }}/></Paragraph>
          </Box> 
        }
      </DialogContent>
      <DialogActions>
        <DialogActionsButtons okButton={okButton} 
                              cancelButton={<DefaultDialogCancelButton onCancel={handleCancel} cancelLabel={t("common:cancel")} />} />
    </DialogActions>
    </Dialog>
  )
}