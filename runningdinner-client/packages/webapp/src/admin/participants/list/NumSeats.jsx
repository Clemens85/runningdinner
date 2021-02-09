import React from 'react'
import {Chip, Tooltip} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {canHost, isNumSeatsUnknown} from "@runningdinner/shared";


const useChipStyles = makeStyles(() => ({
  root: {
    color: 'white'
  }
}));

export default function NumSeats({participant, runningDinnerSessionData}) {

  const classes = useChipStyles();

  const {numSeatsNeededForHost} = runningDinnerSessionData;

  const canHost = canHost(participant, numSeatsNeededForHost);
  const numSeatsUnknown = isNumSeatsUnknown(participant);

  if (numSeatsUnknown) {
    return (
        <Tooltip title={"Keine Angabe über Sitzplatzkapazitäten"} aria-label={"Keine Angabe über Sitzplatzkapazitäten"} placement="top-end">
          <Chip label={'?'} variant={"outlined"} size={"small"} />
        </Tooltip>
    );
  }

  const { numSeats } = participant;
  const color = canHost ? 'primary' : 'secondary';
  const tooltipLabel = canHost ? 'Genügend Sitzplätze vorhanden' : 'Sitzplatz-Kapazität nicht ausreichend';

  return (
      <Tooltip title={tooltipLabel} aria-label={tooltipLabel} placement="top-end">
        <Chip label={numSeats} color={color} size={"small"} className={classes.root} />
      </Tooltip>
  );

}
