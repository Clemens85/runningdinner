import {Button} from "@material-ui/core";
import React from "react";

export default function SecondaryButton(props) {

  const {onClick, children, ...rest} = props;

  return (
    <Button onClick={onClick} color="default" {...rest}>{props.children}</Button>
  );
}