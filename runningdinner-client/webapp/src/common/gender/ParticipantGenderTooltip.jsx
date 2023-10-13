import React from "react";
import { Tooltip } from "@mui/material";
import {ValueTranslate} from "@runningdinner/shared";

export default function ParticipantGenderTooltip(props) {

  const {gender} = props;
  const title = <ValueTranslate value={gender} ns="common" prefix="gender" valueMapping={{'undefined': 'unknown'}}/>;

  return (
    <Tooltip title={title} aria-label={gender} placement="top-end">
      {props.children}
    </Tooltip>
  );
}
