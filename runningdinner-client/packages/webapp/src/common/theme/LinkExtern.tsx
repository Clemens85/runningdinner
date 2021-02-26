import {Link, Typography} from "@material-ui/core";
import React from "react";

export interface LinkExternProps {
  href: string;
  title: React.ReactNode;
}

export default function LinkExtern({href, title}: LinkExternProps) {

  return (
      <Link href={href} color="primary" target={"_blank"}>
        <Typography variant={"body2"} component={"span"}>{title}</Typography>
      </Link>
  );
}
