import {Button} from "@material-ui/core";
import React from "react";

export default function SecondaryButton(props) {

  const {onClick} = props;
  return (
    <Button onClick={onClick} color="default">{props.children}</Button>
  );
}