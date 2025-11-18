import { Link } from '@mui/material';
import { isStringEmpty, Parent } from '@runningdinner/shared';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkInternProps extends Parent {
  pathname: string;
  color?: string;
  href?: string;
  target?: string;
}

export default function LinkIntern({ pathname, color, href, target, children }: LinkInternProps) {
  const colorToSet = isStringEmpty(color) ? 'primary' : color;

  return (
    // @ts-ignore
    <Link to={{ pathname: pathname }} component={RouterLink} color={colorToSet} href={href} target={target} underline="hover">
      {children}
    </Link>
  );
}
