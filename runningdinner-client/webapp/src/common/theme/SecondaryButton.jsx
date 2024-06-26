import {Button} from "@mui/material";
import React from "react";

export default function SecondaryButton(props) {

  const {onClick, children, ...rest} = props;

  return <Button color={"inherit"} onClick={onClick} {...rest}>{props.children}</Button>;
}