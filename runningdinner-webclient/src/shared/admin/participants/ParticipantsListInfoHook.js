import {useCallback, useEffect, useState} from "react";
import ParticipantService from "../ParticipantService";
import get from 'lodash/get';
import find from 'lodash/find';
import {useTranslation} from "react-i18next";

function useParticipantsListInfo(participants, runningDinnerSessionData) {

  const [participantInfo, setParticipantInfo] = useState({});
  const {t} = useTranslation('admin');

  function _calculateParticipantInfo() {

    const numParticipants = participants ? participants.length : 0;

    let result = {
      title: '',
      message: '',
      severity: '',
      show: false
    };

    if (numParticipants === 0) {
      result = {
        title: t('participants_no_existing'),
        message: t('participants_no_existing_text'),
        severity: 'info',
        show: true
      };
    } else {
      const notAssignableParticipants = ParticipantService.getNotAssignableParticipants(participants);
      if (notAssignableParticipants.length === 0) {
        result = {
          title: t('participants_all_assignable_headline'),
          message: t('participants_all_assignable_text'),
          severity: 'success',
          show: true
        };
      } else {
        const {minSizeNeeded, missingParticipants, teamsAlreadyGenerated} = _getInfoForNotEnoughParticipants();
        if (missingParticipants >= 1 && !teamsAlreadyGenerated) {
          result = {
            title: t('participants_not_enough'),
            message: t('participants_too_few_text', { minSizeNeeded: minSizeNeeded, missingParticipants: missingParticipants }),
            severity: 'info',
            show: true
          };
        }
      }
    }

    setParticipantInfo(result);
  }

  function _getInfoForNotEnoughParticipants() {
    const numParticipants = participants ? participants.length : 0;
    const minSizeNeeded = get(runningDinnerSessionData, 'assignableParticipantSizes.minimumParticipantsNeeded', '') || '';
    const missingParticipants = minSizeNeeded !== '' ? (minSizeNeeded - numParticipants) : '';
    const teamsAlreadyGenerated = !!find(participants, 'teamId'); // If at least one participant has teamId set, then we know that there were enough participants
    return {
      minSizeNeeded,
      missingParticipants,
      teamsAlreadyGenerated
    };
  }

  const calculateParticipantInfo = useCallback(() => {
    _calculateParticipantInfo(); // eslint-disable-next-line
  }, [participants]);


  useEffect(() => {
    calculateParticipantInfo();
  }, [calculateParticipantInfo]);

  return participantInfo;
}

export default useParticipantsListInfo;
