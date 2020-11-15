import {Link} from "@material-ui/core";
import {SmallTitle} from "common/theme/typography/Tags";
import React from "react";

export default function LinkExtern(props) {

  const {href, title} = props;
  return (
      <Link href={href} color="primary" target={"_blank"}>
        <SmallTitle>{title}</SmallTitle>
      </Link>
  );
}
