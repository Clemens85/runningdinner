import {useMediaQuery, useTheme} from "@mui/material";

export function useCustomMediaQuery() {

  const theme = useTheme();
  
  return {
    isDeviceBiggerAs: (minWidthInPixels: number) => {
      const isMatch = useMediaQuery(`(min-width:${minWidthInPixels}px)`);
      return isMatch;
    },
    isBigTabletDevice: () => {
      const isLgDevice = useMediaQuery(theme.breakpoints.up('lg'));
      const isMdDevice = useMediaQuery(theme.breakpoints.up('md'));
      return isMdDevice && !isLgDevice;
    }
  }
}