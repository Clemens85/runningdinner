import React from 'react'
import { TableRow, TableCell, Hidden } from "@material-ui/core";
import ParticipantGenderIcon from "../../../common/gender/ParticipantGenderIcon";
import ParticipantGenderTooltip from "../../../common/gender/ParticipantGenderTooltip";
import NumSeats from "./NumSeats";
import useCommonStyles from "../../../common/theme/CommonStyles";
import {Fullname, AddressLocation} from "@runningdinner/shared";

export default function ParticipantRow({participant, selected, onClick, runningDinnerSessionData}) {

  const classes = useCommonStyles();

  const {participantNumber} = participant;
  const {gender} = participant;
  const {email} = participant;

  return (
      <TableRow hover className={classes.cursorPointer} onClick={() => onClick(participant)} selected={selected}>
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
