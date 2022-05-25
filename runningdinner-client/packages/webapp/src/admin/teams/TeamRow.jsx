import { TableRow, TableCell, Hidden, Button } from "@material-ui/core";
import React from "react";
import NumSeats from "../participants/list/NumSeats";
import ParticipantGenderTooltip from "../../common/gender/ParticipantGenderTooltip";
import ParticipantGenderIcon from "../../common/gender/ParticipantGenderIcon";
import {useDrag, useDrop} from "react-dnd";
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import {makeStyles} from "@material-ui/core/styles";
import {CancelledTeamMember} from "./CancelledTeamMember";
import useCommonStyles from "../../common/theme/CommonStyles";
import {generateCancelledTeamMembersAsNumberArray, CONSTANTS, Fullname} from "@runningdinner/shared";

const useParticipantStyles = makeStyles(() => ({
  cellPadding: {
    paddingTop: '1px',
    paddingBottom: '1px'
  }
}));

export default function TeamRow({team, onClick, onTeamMemberSwap, onOpenChangeTeamHostDialog, selected, runningDinnerSessionData, teamSize}) {

  const classes = useCommonStyles();
  const participantClasses = useParticipantStyles();

  const {teamNumber, teamMembers, meal, hostTeamMember } = team;

  let teamMemberNames = teamMembers.map(participant => <DragAnDroppableTeamMember key={participant.id} participant={participant} onTeamMemberSwap={onTeamMemberSwap}/>);
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, teamSize);
  teamMemberNames = teamMemberNames.concat(
      cancelledTeamMembers.map(cancelledTeamMember => <TeamMember key={cancelledTeamMember} participant={null} />)
  );

  const teamMemberSeats = teamMembers.map(participant => <div key={participant.id} className={participantClasses.cellPadding}><NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData} /></div>);
  const teamMemberGenders = teamMembers.map(participant => <div key={participant.id}>
                                                              <ParticipantGenderTooltip gender={participant.gender}>
                                                                <ParticipantGenderIcon gender={participant.gender} disableRipple={true} disableTouchRipple={true}
                                                                                       disableFocusRipple={true} style={{ backgroundColor: 'transparent', paddingTop: '1px', paddingBottom: '1px' }} />
                                                              </ParticipantGenderTooltip>
                                                            </div>);

  const handleOpenChangeTeamHostDialog = event => {
    event.preventDefault();
    event.stopPropagation();
    onOpenChangeTeamHostDialog(team);
  };

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;

  return (
      <TableRow hover className={classes.cursorPointer} onClick={() => onClick(team)} selected={selected} data-testid="team-row">
        <TableCell>{teamNumber}</TableCell>
        <TableCell>{isCancelled ? <CancelledTeamMember /> : teamMemberNames }</TableCell>
        <Hidden xsDown>
          <TableCell>{!isCancelled && teamMemberSeats}</TableCell>
          <TableCell>{!isCancelled && teamMemberGenders}</TableCell>
        </Hidden>
        <TableCell>{meal.label}</TableCell>
        <Hidden xsDown>
          <TableCell>
            {!isCancelled &&
                <Button color="primary" startIcon={<HomeRoundedIcon/>}
                        disableRipple={true} disableElevation={true} onClick={handleOpenChangeTeamHostDialog}
                        style={{backgroundColor: 'transparent'}}><Fullname {...hostTeamMember} /></Button>
            }
          </TableCell>
        </Hidden>
      </TableRow>
  );
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

  const participantClasses = useParticipantStyles();

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
        <div ref={drag}
             className={participantClasses.cellPadding}
              style={{ border: isDragging ? '1px solid black' : 'none' }}>
          <TeamMember participant={participant} />
        </div>
      </div>
  );
}
