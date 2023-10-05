import {RefObject} from "react";
import {useMediaQuery, useTheme} from "@mui/material";
import { useElementPosition } from "./ElementPositionHook";
import { useWindowSize } from "./WindowSizeHook";

export function useDynamicFullscreenHeight(containerRef: RefObject<HTMLElement>, minHeight: number) {

  const browserOffset = 20; // Add 20 px offset for browser

  const {innerHeight} = useWindowSize();
  const { top } = useElementPosition(containerRef);
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  let resultHeight = innerHeight && top && !isSmallDevice ? innerHeight - top - browserOffset : minHeight;
  if (resultHeight < minHeight) {
    resultHeight = minHeight;
  }
  return resultHeight;
}
