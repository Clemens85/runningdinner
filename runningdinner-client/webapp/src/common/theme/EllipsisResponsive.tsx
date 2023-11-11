import { getTruncatedText } from "@runningdinner/shared";
import {useIsDeviceBig} from "./IsDeviceBigHook";
import { Tooltip } from "@mui/material";

type EllipsisResponsiveProps = {
  text: string;
  numCharsBeforeTruncaction: number;
};

export function EllipsisResponsive({text, numCharsBeforeTruncaction}: EllipsisResponsiveProps) {

  const isBigDevice = useIsDeviceBig(1450);

  if (isBigDevice || text.length <= numCharsBeforeTruncaction) {
    return <span>{text}</span>
  }

  const truncatedText = getTruncatedText(text, numCharsBeforeTruncaction);
  return (
    <Tooltip title={text} aria-label={text} placement="top-end">
      <span>{truncatedText}</span>
    </Tooltip>
  )
}