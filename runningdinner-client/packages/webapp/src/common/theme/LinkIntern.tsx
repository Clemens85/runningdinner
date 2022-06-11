import {Link} from "@material-ui/core";
import {Link as RouterLink} from "react-router-dom";
import React from "react";
import {isStringEmpty, Parent} from "@runningdinner/shared";

export interface LinkInternProps extends Parent {
  pathname: string;
  color?: string;
  href?: string;
}

export default function LinkIntern({pathname, color, href, children}: LinkInternProps) {

  const colorToSet = isStringEmpty(color) ? "primary" : color;

  return (
      // @ts-ignore
      <Link to={{ pathname: pathname}} component={RouterLink} color={colorToSet} href={href}>
        {children}
      </Link>
  );
}
