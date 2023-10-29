import {Link, Typography} from "@mui/material";
import {isStringNotEmpty, Parent} from "@runningdinner/shared";

export interface LinkExternProps extends Parent {
  href: string;
  title?: string
  self?: boolean;
}

export default function LinkExtern({href, title, self, children}: LinkExternProps) {

  const target = self ? "_self" : "_blank";

  return (
    <Link href={href} color="primary" target={target} underline="hover">
      { isStringNotEmpty(title) && <Typography variant={"body2"} component={"span"}>{title}</Typography> }
      { children }
    </Link>
  );
}
