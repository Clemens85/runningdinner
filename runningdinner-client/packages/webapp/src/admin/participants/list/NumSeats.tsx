import React from 'react'
import {Chip, Tooltip} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {canHost, isNumSeatsUnknown, Participant, RunningDinnerSessionData} from "@runningdinner/shared";


const useChipStyles = makeStyles(() => ({
  root: {
    color: 'white'
  }
}));

export interface NumSeatsProps {
  participant: Participant,
  runningDinnerSessionData: RunningDinnerSessionData
}

export default function NumSeats({participant, runningDinnerSessionData}: NumSeatsProps) {

  const classes = useChipStyles();

  const {numSeatsNeededForHost} = runningDinnerSessionData;

  const numSeatsUnknown = isNumSeatsUnknown(participant);

  if (numSeatsUnknown) {
    return (
        <Tooltip title={"Keine Angabe über Sitzplatzkapazitäten"} aria-label={"Keine Angabe über Sitzplatzkapazitäten"} placement="top-end">
          <Chip label={'?'} variant={"outlined"} size={"small"} />
        </Tooltip>
    );
  }

  const { numSeats } = participant;
  const color = canHost(participant, numSeatsNeededForHost) ? 'primary' : 'secondary';
  const tooltipLabel = canHost(participant, numSeatsNeededForHost) ? 'Genügend Sitzplätze vorhanden' : 'Sitzplatz-Kapazität nicht ausreichend';

  return (
      <Tooltip title={tooltipLabel} aria-label={tooltipLabel} placement="top-end">
        <Chip label={numSeats} color={color} size={"small"} className={classes.root} />
      </Tooltip>
  );

}
