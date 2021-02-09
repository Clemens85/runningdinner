import {Link} from "@material-ui/core";
import {Link as RouterLink} from "react-router-dom";
import React from "react";

export default function LinkIntern(props) {

  const {pathname} = props;
  return (
      <Link to={{ pathname: pathname}} component={RouterLink} color="primary">
        {props.children}
      </Link>
  );
}
