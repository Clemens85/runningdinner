import React from "react";
import {formatLocalDate} from "./DateUtils";

export default function LocalDate(props) {
  const formattedDate = formatLocalDate(props.date);
  return (
      <>{formattedDate ? formattedDate : ''}</>
  );
}
