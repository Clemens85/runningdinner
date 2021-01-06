import React from "react";
import {formatLocalDate} from "./DateUtils";

function LocalDate(props) {
  const formattedDate = formatLocalDate(props.date);
  return (
      <>{formattedDate ? formattedDate : ''}</>
  );
}

export {
  LocalDate
};
