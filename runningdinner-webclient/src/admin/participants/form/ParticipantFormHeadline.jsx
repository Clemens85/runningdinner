import React from 'react'
import {isStringEmpty} from "../../../shared/Utils";
import {useFormContext} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {Subtitle} from "../../../common/theme/typography/Tags";
import {Fullname} from "../../../shared/Fullname";

export default function ParticipantFormHeadline() {

  const {t} = useTranslation('admin');

  const {watch} = useFormContext();

  const firstnamePart = watch('firstnamePart');
  const lastname = watch('lastname');

  const participant = {
    firstnamePart: firstnamePart,
    lastname: lastname
  };

  let headline = t('participant_new');
  if (!isStringEmpty(participant.firstnamePart) || !isStringEmpty(participant.lastname)) {
    headline = <Fullname {...participant}></Fullname>;
  }

  return <Subtitle>{headline}</Subtitle>;

}
