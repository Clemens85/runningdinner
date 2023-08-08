import {Button} from "@mui/material";
import React from "react";

export default function SecondaryButton(props) {

  const {onClick, children, ...rest} = props;

  return <Button onClick={onClick} {...rest}>{props.children}</Button>;
}