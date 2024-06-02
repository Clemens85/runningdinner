import { Breakpoint, useMediaQuery, useTheme } from "@mui/material";

export function useIsDeviceMinWidth(minWidthInPixels: number) {
  return useMediaQuery(`(min-width:${minWidthInPixels}px)`);
}

export function useIsBigTabletDevice() {
  const theme = useTheme();
  const isLgDevice = useMediaQuery(theme.breakpoints.up("lg"));
  const isMdDevice = useMediaQuery(theme.breakpoints.up("md"));
  return isMdDevice && !isLgDevice;
}

export function useIsMobileDevice(breakpoint: Breakpoint = "md") {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
}

export function useIsBigDevice(breakpoint: Breakpoint = "lg") {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}
