import {Link} from "@mui/material";
import React from "react";
import useCommonStyles from "./CommonStyles";

export default function LinkAction(props) {

  const commonStyles = useCommonStyles();
  const { onClick, ...remainder } = props;
  return (
    <Link
      component="button"
      onClick={onClick}
      className={commonStyles.textTransformUppercase}
      {...remainder}
      underline="hover">
      {props.children}
    </Link>
  );
}
