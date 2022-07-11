import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import { ParticipantList } from "../../types";

export interface ParticipantListInfo {
  title: string,
  message: string,
  severity: string,
  show: boolean
}

const emptyParticipantListInfo: ParticipantListInfo = {
  title: '',
  message: '',
  severity: '',
  show: false
};

export function useParticipantsListInfo(participantList: ParticipantList): ParticipantListInfo {

  const [participantInfo, setParticipantInfo] = useState<ParticipantListInfo>(emptyParticipantListInfo);

  const {t} = useTranslation('admin');

  function _calculateParticipantInfo() {

    const {numParticipantsTotal, teamsGenerated} = participantList;

    let result = emptyParticipantListInfo;

    if (numParticipantsTotal === 0) {
      result = {
        title: t('participants_no_existing'),
        message: t('participants_no_existing_text'),
        severity: 'info',
        show: true
      };
    } else {
      const { participantsWaitingList } = participantList;
      if (participantsWaitingList.length === 0 && participantList.missingParticipantsInfo.numParticipantsMissing <= 0) {
        result = {
          title: t('participants_all_assignable_headline'),
          message: t('participants_all_assignable_text'),
          severity: 'success',
          show: true
        };
      } else if (participantsWaitingList.length > 0 && teamsGenerated) {
        result = {
          title: '',
          message: t('participants_waitinglist_info_text'),
          severity: 'success',
          show: true
        };
      } else {
        const numParticipantsMissing = participantList.missingParticipantsInfo.numParticipantsMissing;
        const numMinParticipantsNeeded = participantList.missingParticipantsInfo.numMinParticipantsNeeded;
        if (numParticipantsMissing > 0 && !teamsGenerated) {
          result = {
            title: t('participants_not_enough'),
            message: t('participants_too_few_text', { minSizeNeeded: numMinParticipantsNeeded, missingParticipants: numParticipantsMissing }),
            severity: 'info',
            show: true
          };
        }
      }
    }

    setParticipantInfo(result);
  }
  const calculateParticipantInfo = useCallback(() => {
    _calculateParticipantInfo(); // eslint-disable-next-line
  }, [participantList]);

  useEffect(() => {
    calculateParticipantInfo();
  }, [calculateParticipantInfo]);

  return participantInfo;
}
