import React from "react";
import { format } from 'date-fns';
import {useTranslation} from "react-i18next";

function Time({date}) {
  const {t} = useTranslation('common');
  if (!date) {
    return null;
  }
  const formattedTime = format(date, 'HH:mm');
  return (
      <>{formattedTime} {t('uhr')}</>
  );
}

export {
  Time
};
