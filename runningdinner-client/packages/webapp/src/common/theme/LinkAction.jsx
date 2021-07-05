import {Link} from "@material-ui/core";
import React from "react";
import useCommonStyles from "./CommonStyles";

export default function LinkAction(props) {

  const commonStyles = useCommonStyles();
  const { onClick, ...remainder } = props;
  return (
    <Link component="button" onClick={onClick} {...remainder} className={commonStyles.textTransformUppercase}>{props.children}</Link>
  );
}
