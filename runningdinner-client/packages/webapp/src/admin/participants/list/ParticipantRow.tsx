import React from 'react'
import { TableRow, TableCell, Hidden } from "@material-ui/core";
import ParticipantGenderIcon from "../../../common/gender/ParticipantGenderIcon";
import ParticipantGenderTooltip from "../../../common/gender/ParticipantGenderTooltip";
import NumSeats from "./NumSeats";
import useCommonStyles from "../../../common/theme/CommonStyles";
import {
  Fullname,
  AddressLocation,
  ParticipantListable,
  RunningDinnerSessionData
} from "@runningdinner/shared";


export type ParticipantClickCallback = {
  onClick: (participant: ParticipantListable) => unknown;
};

type ParticipantRowProps = {
  participant: ParticipantListable;
  selected: boolean;
  runningDinnerSessionData: RunningDinnerSessionData;
} & ParticipantClickCallback;

export default function ParticipantRow({participant, selected, onClick, runningDinnerSessionData}: ParticipantRowProps) {

  const classes = useCommonStyles();

  const {listNumber} = participant;
  const {gender} = participant;
  const {email} = participant;

  return (
      <TableRow hover className={classes.cursorPointer} onClick={() => onClick(participant)} selected={selected} data-testid="participant-row">
        <TableCell data-testid={"participant-number"}>{listNumber}</TableCell>
        <TableCell><Fullname {...participant} /></TableCell>
        <Hidden xsDown>
          <TableCell>
            <ParticipantGenderTooltip gender={gender}>
              <ParticipantGenderIcon gender={gender} />
            </ParticipantGenderTooltip>
          </TableCell>
          <TableCell>{email}</TableCell>
          <TableCell><AddressLocation {...participant} /></TableCell>
          <TableCell><NumSeats participant={participant} runningDinnerSessionData={runningDinnerSessionData} /></TableCell>
        </Hidden>
      </TableRow>
  );

}
