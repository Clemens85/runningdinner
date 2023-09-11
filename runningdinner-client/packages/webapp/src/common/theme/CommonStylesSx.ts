import { SxProps, Theme } from "@mui/material";

export const commonStyles: Record<string, SxProps<Theme> | undefined> = {
  textAlignRight: {
    textAlign: 'right'
  },
  fullWidth: {
    width: "100%"
  },
  fullHeight: {
    height: "100%"
  },
  buttonSpacingLeft: {
    marginLeft: (theme) => theme.spacing(2)
  },
  colorSecondary: {
    color: (theme) => theme.palette.secondary.main
  }
}