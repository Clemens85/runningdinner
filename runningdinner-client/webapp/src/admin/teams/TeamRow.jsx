import { TableCell, Button, Box, Tooltip } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { ParticipantMealBadges } from '../participants/meal/ParticipantMealBadges.tsx';
import NumSeats from '../participants/list/NumSeats';
import ParticipantGenderTooltip from '../../common/gender/ParticipantGenderTooltip';
import ParticipantGenderIcon from '../../common/gender/ParticipantGenderIcon';
import { useDrag, useDrop } from 'react-dnd';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { CancelledTeamMember } from './CancelledTeamMember';
import { TableRowWithCursor } from '../../common/theme/CommonStyles';
import { generateCancelledTeamMembersAsNumberArray, CONSTANTS, Fullname, isTeamPartnerWishChild, isHostAccessibilityMissing } from '@runningdinner/shared';
import { TeamPartnerWishIcon } from './TeamPartnerWishIcon';
import { styled } from '@mui/material/styles';

const TableCellContentWithYPadding = styled('div')({
  paddingTop: '1px',
  paddingBottom: '1px',
});

const ParticipantGenderIconWithYPadding = styled(ParticipantGenderIcon)({
  backgroundColor: 'transparent',
  paddingTop: '1px',
  paddingBottom: '1px',
});

export default function TeamRow({ team, onClick, onTeamMemberSwap, onOpenChangeTeamHostDialog, selected, runningDinnerSessionData, teamSize }) {
  const { teamNumber, teamMembers, meal, hostTeamMember } = team;

  let teamMemberNames = teamMembers.map((participant) => <DragAnDroppableTeamMember key={participant.id} participant={participant} onTeamMemberSwap={onTeamMemberSwap} />);
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, teamSize);
  teamMemberNames = teamMemberNames.concat(cancelledTeamMembers.map((cancelledTeamMember) => <TeamMember key={cancelledTeamMember} participant={null} />));

  const teamMemberSeats = teamMembers.map((participant) => (
    <TableCellContentWithYPadding key={participant.id}>
      {!isTeamPartnerWishChild(participant) && <NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData} />}
    </TableCellContentWithYPadding>
  ));
  const teamMemberGenders = teamMembers.map((participant) => (
    <div key={participant.id}>
      {!isTeamPartnerWishChild(participant) && (
        <ParticipantGenderTooltip gender={participant.gender}>
          <ParticipantGenderIconWithYPadding gender={participant.gender} disableRipple={true} disableTouchRipple={true} disableFocusRipple={true} />
        </ParticipantGenderTooltip>
      )}
    </div>
  ));

  const handleOpenChangeTeamHostDialog = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenChangeTeamHostDialog(team);
  };

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  const hostAccessibilityMissing = !isCancelled && isHostAccessibilityMissing(team, runningDinnerSessionData.numSeatsNeededForHost);

  return (
    <TableRowWithCursor hover onClick={() => onClick(team)} selected={selected} data-testid="team-row">
      <TableCell>{teamNumber}</TableCell>
      <TableCell>{isCancelled ? <CancelledTeamMember /> : teamMemberNames}</TableCell>
      <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>{!isCancelled && teamMemberSeats}</TableCell>
      <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>{!isCancelled && teamMemberGenders}</TableCell>
      <TableCell>{meal.label}</TableCell>
      <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>
        <ChangeTeamHostButton
          handleOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog}
          hostTeamMember={hostTeamMember}
          isCancelled={isCancelled}
          hostAccessibilityMissing={hostAccessibilityMissing}
        />
      </TableCell>
      <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>
        <TeamPartnerWishIcon team={team} showLabelAsTooltip={true} />
      </TableCell>
    </TableRowWithCursor>
  );
}

function ChangeTeamHostButton({ isCancelled, hostTeamMember, handleOpenChangeTeamHostDialog, hostAccessibilityMissing }) {
  const { t } = useTranslation('admin');
  if (!isCancelled) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Button
          color="primary"
          startIcon={<HomeRoundedIcon />}
          disableRipple={true}
          disableElevation={true}
          onClick={handleOpenChangeTeamHostDialog}
          style={{ backgroundColor: 'transparent' }}
        >
          <Fullname {...hostTeamMember} />
        </Button>
        {hostAccessibilityMissing && (
          <Tooltip title={t('admin:accessibility_team_host_not_accessible')} placement="top-end">
            <WarningAmberRoundedIcon fontSize="small" color="warning" sx={{ display: 'block' }} data-testid="team-host-accessibility-warning" />
          </Tooltip>
        )}
      </Box>
    );
  }
  return null;
}

function TeamMember({ participant }) {
  if (!participant) {
    return <CancelledTeamMember />;
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.25 }}>
      <Fullname {...participant} />
      <ParticipantMealBadges participant={participant} />
    </Box>
  );
}

function DragAnDroppableTeamMember({ participant, onTeamMemberSwap }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'TEAM_MEMBER',
      item: {
        id: participant.id,
        teamId: participant.teamId,
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [],
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'TEAM_MEMBER',
      drop: (item) => handleDrop(item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [],
  );

  function handleDrop(srcItem) {
    if (srcItem.id === participant.id) {
      return;
    }
    if (srcItem.teamId === participant.teamId) {
      return;
    }
    onTeamMemberSwap(srcItem.id, participant.id);
  }

  return (
    <div ref={drop} style={{ border: isOver ? '1px dotted black' : 'none' }}>
      <TableCellContentWithYPadding ref={drag} style={{ border: isDragging ? '1px solid black' : 'none' }}>
        <TeamMember participant={participant} />
      </TableCellContentWithYPadding>
    </div>
  );
}
