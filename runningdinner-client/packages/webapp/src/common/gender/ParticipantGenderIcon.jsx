import React from "react";
import {CONSTANTS} from "@runningdinner/shared";
import { Icon, IconButton } from "@material-ui/core";

const ParticipantGenderIcon = React.forwardRef( (props, ref) => {

  const {gender} = props;

  function onClick() {
    if (props.onClick) {
      props.onClick(gender);
    }
  }

  if (gender === CONSTANTS.GENDER.MALE) {
    return (
        <IconButton onClick={onClick} {...props} component="span" ref={ref}>
          <Icon className={"fas fa-mars"} />
        </IconButton>
    );
  }
  if (gender === CONSTANTS.GENDER.FEMALE) {
    return (
        <IconButton onClick={onClick} {...props} component="span" ref={ref}>
          <Icon className={"fas fa-venus"} />
        </IconButton>
    );
  }
  if (gender === CONSTANTS.GENDER.UNDEFINED) {
    return (
        <IconButton onClick={onClick} {...props} component="span" ref={ref}>
          <Icon className={"fas fa-genderless"} />
        </IconButton>
    );
  }
  return null;

});
export default ParticipantGenderIcon;
