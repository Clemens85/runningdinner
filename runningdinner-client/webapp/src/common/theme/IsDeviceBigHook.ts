import {useMediaQuery} from "@mui/material";

export function useIsDeviceBig(minWidthInPixels: number) {
  const isBigDevice = useMediaQuery(`(min-width:${minWidthInPixels}px)`);
  return isBigDevice;
}