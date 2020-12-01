import {useTranslation} from "react-i18next";
import ParticipantService from "../../shared/admin/ParticipantService";
import {
  Dialog,
  DialogContent,
  FormControl,
  MenuItem,
  Box,
  Select,
} from "@material-ui/core";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import React, {useState} from "react";
import Paragraph from "../../common/theme/typography/Paragraph";
import {findEntityById} from "../../shared/Utils";
import TeamService from "../../shared/admin/TeamService";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import {Subtitle} from "common/theme/typography/Tags";
import {useSnackbar} from "notistack";


export const ChangeTeamHostDialog = ({adminId, team, isOpen, onClose, onTeamHostChanged}) => {

  const {t} = useTranslation(['admin', 'common']);
  const [selectedHostTeamMember, setSelectedHostTeamMember] = useState(team.hostTeamMember);
  const {enqueueSnackbar} = useSnackbar();

  const { teamNumber, teamMembers } = team;

  const saveTeamHostAsync = async() => {
    const updatedTeam = await TeamService.updateTeamHostAsync(adminId, team, selectedHostTeamMember);
    onClose();
    onTeamHostChanged(updatedTeam);
    enqueueSnackbar(t("team_host_saved"), {variant: "success"});
  };

  function handleTeamHostChange(changeEvt) {
    const changedValue = changeEvt.target.value;
    const changedTeamHostMember = findEntityById(teamMembers, changedValue);
    setSelectedHostTeamMember(changedTeamHostMember);
  }

  const selectedHostTeamMemberFullname = ParticipantService.getFullname(selectedHostTeamMember);
  const hostsToSelect = teamMembers.map((teamMember) =>
      <MenuItem value={teamMember.id} key={teamMember.id}>{ParticipantService.getFullname(teamMember)}</MenuItem>
  );

  return (
      <Dialog open={isOpen} onClose={onClose} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={onClose}>{t('teams_host_change')}</DialogTitleCloseable>
          <DialogContent>
            <Subtitle i18n="admin:team" parameters={{ teamNumber }} />
            <FormControl fullWidth>
              <Select name="teamHost"
                      onChange={handleTeamHostChange}
                      value={selectedHostTeamMember.id}>
                {hostsToSelect}
              </Select>
            </FormControl>
            <Box mt={2}>
              <Paragraph i18n="admin:teams_host" parameters={{host: selectedHostTeamMemberFullname}} html={true} />
            </Box>
          </DialogContent>
          <DialogActionsPanel onOk={saveTeamHostAsync} onCancel={onClose} okLabel={t('common:save')} cancelLabel={t('common:cancel')} />
      </Dialog>
  );
};
