import React from 'react'
import { TableRow, TableCell, Hidden } from "@material-ui/core";
import Fullname from "../../../shared/Fullname";
import ParticipantGenderIcon from "../../../common/gender/ParticipantGenderIcon";
import AddressLocation from "../../../shared/AddressLocation";
import ParticipantGenderTooltip from "../../../common/gender/ParticipantGenderTooltip";
import NumSeats from "./NumSeats";
import useTableStyles from "../../../common/theme/TableStyles";

export default function ParticipantRow({participant, selected, onClick, runningDinnerSessionData}) {

  const classes = useTableStyles();

  const {participantNumber} = participant;
  const {gender} = participant;
  const {email} = participant;

  return (
      <TableRow hover className={classes.tableRowCursor} onClick={() => onClick(participant)} selected={selected}>
        <TableCell>{participantNumber}</TableCell>
        <TableCell><Fullname {...participant}></Fullname></TableCell>
        <Hidden xsDown>
          <TableCell>
            <ParticipantGenderTooltip gender={gender}>
              <ParticipantGenderIcon gender={gender}></ParticipantGenderIcon>
            </ParticipantGenderTooltip>
          </TableCell>
          <TableCell>{email}</TableCell>
          <TableCell><AddressLocation {...participant}></AddressLocation></TableCell>
          <TableCell><NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData}></NumSeats></TableCell>
        </Hidden>
      </TableRow>
  );

}
