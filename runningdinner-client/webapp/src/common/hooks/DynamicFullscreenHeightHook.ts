import { useMediaQuery, useTheme } from '@mui/material';
import { RefObject } from 'react';

import { useElementPosition } from './ElementPositionHook';
import { useWindowSize } from './WindowSizeHook';

export function useDynamicFullscreenHeight(containerRef: RefObject<HTMLElement>, minHeight: number, calculateForSmallDevice: boolean = false) {
  const browserOffset = 20; // Add 20 px offset for browser

  const { innerHeight } = useWindowSize();
  const { top } = useElementPosition(containerRef);
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  const performDynamicCalculation = !isSmallDevice || calculateForSmallDevice;

  let resultHeight = innerHeight && top && performDynamicCalculation ? innerHeight - top - browserOffset : minHeight;
  if (resultHeight < minHeight) {
    resultHeight = minHeight;
  }
  return resultHeight;
}
