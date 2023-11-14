import {useMediaQuery, useTheme} from "@mui/material";

export function useIsDeviceMinWidth(minWidthInPixels: number) {
  return useMediaQuery(`(min-width:${minWidthInPixels}px)`);
}

export function useIsBigTabletDevice() {
  const theme = useTheme();
  const isLgDevice = useMediaQuery(theme.breakpoints.up('lg'));
  const isMdDevice = useMediaQuery(theme.breakpoints.up('md'));
  return isMdDevice && !isLgDevice;
}