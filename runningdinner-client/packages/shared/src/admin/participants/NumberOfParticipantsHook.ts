import {useCallback, useEffect, useState} from "react";
import get from "lodash/get";
import { getAssignableParticipants, getParticipantsOrganizedInTeams } from "../ParticipantService";
import {Participant, RunningDinnerSessionData} from "../../types";

export interface NumberOfParticipants {
  numberOfParticipantsTotal: number,
  numberOfParticipantsWaitingList: number,
  hasNotEnoughtParticipantsForDinner: boolean;
}

export function useNumberOfParticipants(participants: Participant[], runningDinnerSessionData: RunningDinnerSessionData): NumberOfParticipants {

  const [numberOfParticipants, setNumberOfParticipants] = useState<NumberOfParticipants>({
    numberOfParticipantsTotal: 0,
    numberOfParticipantsWaitingList: 0,
    hasNotEnoughtParticipantsForDinner: false
  });

  function _calculateNumberOfParticipants() {

    const numberOfParticipantsTotal = participants ? participants.length : 0;
    let numberOfParticipantsWaitingList = 0;

    const minSizeNeeded = get(runningDinnerSessionData, 'assignableParticipantSizes.minimumParticipantsNeeded', '') || '';
    if (numberOfParticipantsTotal > minSizeNeeded) {
      const assignableParticipants = getAssignableParticipants(participants);
      const participantsAssignedIntoTeams = getParticipantsOrganizedInTeams(participants);
      const numAllAssignableParticipants = assignableParticipants.length + participantsAssignedIntoTeams.length;
      numberOfParticipantsWaitingList = numberOfParticipantsTotal - numAllAssignableParticipants;
    }

    setNumberOfParticipants({
      numberOfParticipantsTotal: numberOfParticipantsTotal,
      numberOfParticipantsWaitingList: numberOfParticipantsWaitingList,
      hasNotEnoughtParticipantsForDinner: numberOfParticipantsTotal < minSizeNeeded
    });
  }

  const calculateParticipantInfo = useCallback(() => {
    _calculateNumberOfParticipants(); // eslint-disable-next-line
  }, [participants, runningDinnerSessionData]);


  useEffect(() => {
    calculateParticipantInfo();
  }, [calculateParticipantInfo]);

  return numberOfParticipants;
}

