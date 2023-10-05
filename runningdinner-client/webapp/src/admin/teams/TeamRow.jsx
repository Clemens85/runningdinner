import {TableCell, Hidden, Button} from "@mui/material";
import React from "react";
import NumSeats from "../participants/list/NumSeats";
import ParticipantGenderTooltip from "../../common/gender/ParticipantGenderTooltip";
import ParticipantGenderIcon from "../../common/gender/ParticipantGenderIcon";
import {useDrag, useDrop} from "react-dnd";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import {CancelledTeamMember} from "./CancelledTeamMember";
import {TableRowWithCursor} from "../../common/theme/CommonStyles";
import {
  generateCancelledTeamMembersAsNumberArray,
  CONSTANTS,
  Fullname,
  isTeamPartnerWishChild,
} from "@runningdinner/shared";
import {TeamPartnerWishIcon} from "./TeamPartnerWishIcon";
import {styled} from "@mui/material/styles";

const TableCellContentWithYPadding = styled('div')( {
  paddingTop: '1px',
  paddingBottom: '1px'
});

const ParticipantGenderIconWithYPadding = styled(ParticipantGenderIcon)( {
  backgroundColor: 'transparent',
  paddingTop: '1px',
  paddingBottom: '1px'
});

export default function TeamRow({team, onClick, onTeamMemberSwap, onOpenChangeTeamHostDialog, selected, runningDinnerSessionData, teamSize}) {

  const {teamNumber, teamMembers, meal, hostTeamMember } = team;

  let teamMemberNames = teamMembers.map(participant => <DragAnDroppableTeamMember key={participant.id} participant={participant} onTeamMemberSwap={onTeamMemberSwap}/>);
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, teamSize);
  teamMemberNames = teamMemberNames.concat(
      cancelledTeamMembers.map(cancelledTeamMember => <TeamMember key={cancelledTeamMember} participant={null} />)
  );

  const teamMemberSeats = teamMembers.map(participant => <TableCellContentWithYPadding key={participant.id}>
                                                            {!isTeamPartnerWishChild(participant) &&
                                                              <NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData}/>
                                                            }
                                                          </TableCellContentWithYPadding>);
  const teamMemberGenders = teamMembers.map(participant => <div key={participant.id}>
                                                              {!isTeamPartnerWishChild(participant) &&
                                                                <ParticipantGenderTooltip gender={participant.gender}>
                                                                  <ParticipantGenderIconWithYPadding gender={participant.gender}
                                                                                                     disableRipple={true} disableTouchRipple={true} disableFocusRipple={true} />
                                                                </ParticipantGenderTooltip>
                                                              }
                                                            </div>);

  const handleOpenChangeTeamHostDialog = event => {
    event.preventDefault();
    event.stopPropagation();
    onOpenChangeTeamHostDialog(team);
  };

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;

  return (
    <TableRowWithCursor hover onClick={() => onClick(team)} selected={selected} data-testid="team-row">
      <TableCell>{teamNumber}</TableCell>
      <TableCell>{isCancelled ? <CancelledTeamMember /> : teamMemberNames }</TableCell>
      <Hidden smDown>
        <TableCell>{!isCancelled && teamMemberSeats}</TableCell>
        <TableCell>{!isCancelled && teamMemberGenders}</TableCell>
      </Hidden>
      <TableCell>{meal.label}</TableCell>
      <Hidden smDown>
        <TableCell>
          <ChangeTeamHostButton handleOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog} hostTeamMember={hostTeamMember} isCancelled={isCancelled} />
        </TableCell>
        <TableCell><TeamPartnerWishIcon team={team} showLabelAsTooltip={true} /></TableCell>
      </Hidden>
    </TableRowWithCursor>
  );
}

function ChangeTeamHostButton({isCancelled, hostTeamMember, handleOpenChangeTeamHostDialog}) {
  if (!isCancelled) {
    return <Button color="primary" startIcon={<HomeRoundedIcon/>}
                   disableRipple={true} disableElevation={true} onClick={handleOpenChangeTeamHostDialog}
                   style={{backgroundColor: 'transparent'}}>
              <Fullname {...hostTeamMember} />
          </Button>;
  }
  return null;
}

function TeamMember({participant}) {

  if (!participant) {
    return <CancelledTeamMember/>;
  }
  return (
      <Fullname {...participant} />
  );
}

function DragAnDroppableTeamMember({participant, onTeamMemberSwap}) {

  const [{isDragging}, drag] = useDrag({
    item: { type: 'TEAM_MEMBER', id: participant.id, teamId: participant.teamId },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    }),
  });

  const [{ isOver, canDrop },drop] = useDrop({
    accept: 'TEAM_MEMBER',
    drop: (item) => handleDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  function handleDrop(srcItem) {
    onTeamMemberSwap(srcItem.id, participant.id);
  }

  return (
      <div ref={drop}>
        <TableCellContentWithYPadding ref={drag} style={{ border: isDragging ? '1px solid black' : 'none' }}>
          <TeamMember participant={participant} />
        </TableCellContentWithYPadding>
      </div>
  );
}
