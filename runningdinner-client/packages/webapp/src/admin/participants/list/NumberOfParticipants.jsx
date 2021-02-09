import React from 'react'
import {useNumberOfParticipants}  from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import HtmlTranslate from "../../../common/i18n/HtmlTranslate";

export default function NumberOfParticipants({participants, runningDinnerSessionData}) {

  const {t} = useTranslation('admin');

  const { numberOfParticipantsTotal, numberOfParticipantsWaitingList } = useNumberOfParticipants(participants, runningDinnerSessionData);

  let result = <HtmlTranslate i18n="participants_number" ns="admin" parameters={{numberParticipants: numberOfParticipantsTotal}} />;

  let numberOfParticipantsWaitingListInfo = '';
  if (numberOfParticipantsWaitingList > 0) {
    numberOfParticipantsWaitingListInfo = ' ' + t('participants_number_waiting_list', {numRemainingNotAssignableParticipants: numberOfParticipantsWaitingList});
  }

  return (
      <>
        {result} {numberOfParticipantsWaitingListInfo}
      </>
  );

}
