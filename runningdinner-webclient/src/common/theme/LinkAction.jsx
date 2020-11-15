import {Link} from "@material-ui/core";
import React from "react";

export default function LinkAction(props) {

  const { onClick } = props;
  return (
    <Link component="button" onClick={onClick}>{props.children}</Link>
  );
}
