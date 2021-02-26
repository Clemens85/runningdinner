import {Link} from "@material-ui/core";
import {Link as RouterLink} from "react-router-dom";
import React from "react";
import {Parent} from "@runningdinner/shared";

export interface LinkInternProps extends Parent {
  pathname: string;
}

export default function LinkIntern({pathname, children}: LinkInternProps) {

  return (
      <Link to={{ pathname: pathname}} component={RouterLink} color="primary">
        {children}
      </Link>
  );
}
