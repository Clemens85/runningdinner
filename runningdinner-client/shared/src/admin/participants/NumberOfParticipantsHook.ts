import { useCallback, useEffect, useState } from 'react';
import { ParticipantList } from '../../types';

export interface NumberOfParticipants {
  numberOfParticipantsTotal: number;
  numberOfParticipantsWaitingList: number;
  hasNotEnoughParticipantsForDinner: boolean;
}

export function useNumberOfParticipants(participantList: ParticipantList): NumberOfParticipants {
  const [numberOfParticipants, setNumberOfParticipants] = useState<NumberOfParticipants>({
    numberOfParticipantsTotal: 0,
    numberOfParticipantsWaitingList: 0,
    hasNotEnoughParticipantsForDinner: false,
  });

  function _calculateNumberOfParticipants() {
    const numberOfParticipantsTotal = participantList.numParticipantsTotal;
    const numberOfParticipantsWaitingList = participantList.participantsWaitingList.length;
    const hasNotEnoughParticipantsForDinner = participantList.missingParticipantsInfo.numParticipantsMissing > 0;

    setNumberOfParticipants({
      numberOfParticipantsTotal: numberOfParticipantsTotal,
      numberOfParticipantsWaitingList: numberOfParticipantsWaitingList,
      hasNotEnoughParticipantsForDinner: hasNotEnoughParticipantsForDinner,
    });
  }

  const calculateParticipantInfo = useCallback(() => {
    _calculateNumberOfParticipants(); // eslint-disable-next-line
  }, [participantList]);

  useEffect(() => {
    calculateParticipantInfo();
  }, [calculateParticipantInfo]);

  return numberOfParticipants;
}
