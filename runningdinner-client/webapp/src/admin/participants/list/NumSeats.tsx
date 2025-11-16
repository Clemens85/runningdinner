import { Chip, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { canHost, isNumSeatsUnknown, Participant, RunningDinnerSessionData } from '@runningdinner/shared';
import React from 'react';

const ChipWhiteText = styled(Chip)({
  color: 'white',
});

export interface NumSeatsProps {
  participant: Participant;
  runningDinnerSessionData: RunningDinnerSessionData;
}

export default function NumSeats({ participant, runningDinnerSessionData }: NumSeatsProps) {
  const { numSeatsNeededForHost } = runningDinnerSessionData;

  const numSeatsUnknown = isNumSeatsUnknown(participant);

  if (numSeatsUnknown) {
    return (
      <Tooltip title={'Keine Angabe über Sitzplatzkapazitäten'} aria-label={'Keine Angabe über Sitzplatzkapazitäten'} placement="top-end">
        <Chip label={'?'} variant={'outlined'} size={'small'} />
      </Tooltip>
    );
  }

  const { numSeats } = participant;
  const color = canHost(participant, numSeatsNeededForHost) ? 'primary' : 'secondary';
  const tooltipLabel = canHost(participant, numSeatsNeededForHost) ? 'Genügend Sitzplätze vorhanden' : 'Sitzplatz-Kapazität nicht ausreichend';

  return (
    <Tooltip title={tooltipLabel} aria-label={tooltipLabel} placement="top-end">
      <ChipWhiteText label={numSeats} color={color} size={'small'} />
    </Tooltip>
  );
}
