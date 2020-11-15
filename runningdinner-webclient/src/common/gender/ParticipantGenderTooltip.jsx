import React from "react";
import { Tooltip } from "@material-ui/core";
import {getGenderTooltip} from "../../shared/gender/GenderUtils";

export default function ParticipantGenderTooltip(props) {

  const {gender} = props;
  const title = getGenderTooltip(gender);

  return (
    <Tooltip title={title} aria-label={title} placement="top-end">
      {props.children}
    </Tooltip>
  );
}
