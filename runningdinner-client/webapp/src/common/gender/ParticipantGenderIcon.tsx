import React from "react";
import {CallbackHandler, CONSTANTS} from "@runningdinner/shared";
import {Icon, IconButton} from "@mui/material";

export interface ParticipantGenderIconProps {
  gender: string;
  color?: string;
  onClick?: CallbackHandler;
}

const ParticipantGenderIcon = React.forwardRef( (props: ParticipantGenderIconProps, ref) => {

  const {gender} = props;

  function onClick() {
    if (props.onClick) {
      props.onClick(gender);
    }
  }

  if (gender === CONSTANTS.GENDER.MALE) {
    return (
      // @ts-ignore (it is very difficult to provide a valid ref type
      <IconButton
        {...props}
        onClick={onClick}
        component="span"
        ref={ref}
        data-testid="gender-male-action"
        size="large">
        <Icon className={"fas fa-mars"} />
      </IconButton>
    );
  }
  if (gender === CONSTANTS.GENDER.FEMALE) {
    return (
      // @ts-ignore (it is very difficult to provide a valid ref type
      <IconButton
        {...props}
        onClick={onClick}
        component="span"
        ref={ref}
        data-testid="gender-female-action"
        size="large">
        <Icon className={"fas fa-venus"} />
      </IconButton>
    );
  }
  if (gender === CONSTANTS.GENDER.UNDEFINED) {
    return (
      // @ts-ignore (it is very difficult to provide a valid ref type
      <IconButton
        {...props}
        onClick={onClick}
        component="span"
        ref={ref}
        data-testid="gender-undefined-action"
        size="large">
        <Icon className={"fas fa-genderless"} />
      </IconButton>
    );
  }
  return null;

});
export default ParticipantGenderIcon;
