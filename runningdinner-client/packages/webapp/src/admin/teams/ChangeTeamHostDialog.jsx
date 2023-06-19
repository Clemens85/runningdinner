import {useTranslation} from "react-i18next";
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
import {findEntityById, getFullname, isTeamPartnerWishRegistration, updateTeamHostAsync} from "@runningdinner/shared";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import {Subtitle} from "../../common/theme/typography/Tags";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import Alert from "@material-ui/lab/Alert";


export const ChangeTeamHostDialog = ({adminId, team, isOpen, onClose, onTeamHostChanged}) => {

  const {t} = useTranslation(['admin', 'common']);
  const [selectedHostTeamMember, setSelectedHostTeamMember] = useState(team.hostTeamMember);
  const {showSuccess} = useCustomSnackbar();

  const { teamNumber, teamMembers } = team;

  const saveTeamHostAsync = async() => {
    const updatedTeam = await updateTeamHostAsync(adminId, team, selectedHostTeamMember);
    onClose();
    onTeamHostChanged(updatedTeam);
    showSuccess(t("team_host_saved"));
  };

  function handleTeamHostChange(changeEvt) {
    const changedValue = changeEvt.target.value;
    const changedTeamHostMember = findEntityById(teamMembers, changedValue);
    setSelectedHostTeamMember(changedTeamHostMember);
  }

  const selectedHostTeamMemberFullname = getFullname(selectedHostTeamMember);
  const hostsToSelect = teamMembers.map((teamMember) =>
      <MenuItem value={teamMember.id} key={teamMember.id}>{getFullname(teamMember)}</MenuItem>
  );

  if (isTeamPartnerWishRegistration(selectedHostTeamMember)) {
    return (
      <Dialog open={isOpen} onClose={onClose} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={onClose}>{t('teams_host_change')}</DialogTitleCloseable>
        <DialogContent>
          <Subtitle i18n="admin:team" parameters={{ teamNumber }} />
          <Box mt={2}>
            <Alert severity={"info"} variant="outlined">{t("admin:team_partner_wish_registration_change_teamhost_not_possible")}</Alert>
          </Box>
        </DialogContent>
        <DialogActionsPanel onOk={onClose} onCancel={onClose} okLabel={t('common:ok')} cancelLabel={t('common:cancel')} />
      </Dialog>
    );
  }

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
