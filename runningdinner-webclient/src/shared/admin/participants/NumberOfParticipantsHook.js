import {useCallback, useEffect, useState} from "react";
import ParticipantService from "../ParticipantService";
import get from "lodash/get";

function useNumberOfParticipants(participants, runningDinnerSessionData) {

  const [numberOfParticipants, setNumberOfParticipants] = useState({
    numberOfParticipantsTotal: 0,
    numberOfParticipantsWaitingList: 0,
    hasNotEnoughtParticipantsForDinner: false
  });

  function _calculateNumberOfParticipants() {

    const numberOfParticipantsTotal = participants ? participants.length : 0;
    let numberOfParticipantsWaitingList = 0;

    const minSizeNeeded = get(runningDinnerSessionData, 'assignableParticipantSizes.minimumParticipantsNeeded', '') || '';
    if (numberOfParticipantsTotal > minSizeNeeded) {
      const assignableParticipants = ParticipantService.getAssignableParticipants(participants);
      const participantsAssignedIntoTeams = ParticipantService.getParticipantsOrganizedInTeams(participants);
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

export default useNumberOfParticipants;

