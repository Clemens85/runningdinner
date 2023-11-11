import { getTruncatedText } from "@runningdinner/shared";
import {useCustomMediaQuery} from "./CustomMediaQueryHook";
import { Tooltip } from "@mui/material";

type EllipsisResponsiveProps = {
  text: string;
  numCharsBeforeTruncaction: number;
};

export function EllipsisResponsive({text, numCharsBeforeTruncaction}: EllipsisResponsiveProps) {

  const {isDeviceBiggerAs} = useCustomMediaQuery();

  if (isDeviceBiggerAs(1450) || text.length <= numCharsBeforeTruncaction) {
    return <span>{text}</span>
  }

  const truncatedText = getTruncatedText(text, numCharsBeforeTruncaction);
  return (
    <Tooltip title={text} aria-label={text} placement="top-end">
      <span>{truncatedText}</span>
    </Tooltip>
  )
}