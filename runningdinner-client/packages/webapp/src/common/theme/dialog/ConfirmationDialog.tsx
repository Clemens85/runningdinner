import React from "react";
import {
  Box,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  Button,
  makeStyles,
  useMediaQuery,
  Grid,
  useTheme,
} from "@material-ui/core";
import { SpacingButton } from "../SpacingButton";
import { DialogTitleCloseable } from "../DialogTitleCloseable";
import { PrimaryButton } from "../PrimaryButton";

export interface ConfirmationDialogProps extends Partial<DialogProps> {
  /**
   * The title of this dialog (can be any React component). Can also be left empty for no title.
   */
  dialogTitle?: React.ReactNode;

  /**
   * The content that is rendered in the dialog (can be any React component)
   */
  dialogContent?: React.ReactNode;

  /**
   * Label of your primary confirm button (e.g. 'Ok' or 'Save Changes')
   */
  buttonConfirmText: string;

  /**
   * Label of your cancel (reject) button (e.g. 'Cancel'). This option can be omitted, so that the user has not other choice as to confirm.
   */
  buttonCancelText?: string;

  /**
   * If set to true the confirm button will be rendered in a color sgnaling a dangerous action (like e.g. deleting an entity)
   */
  danger?: boolean;

  /**
   * Callback function which is called when the user closes the dialog. The caller component (which owns this dialog) must then close the dialog
   * @param confirmed True if user confirmed
   */
  onClose: (confirmed: boolean) => unknown;
}

const useConfirmationDialogStyles = makeStyles((theme) =>
  createStyles({
    dialogActions: {
      justifyContent: "center",
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(2),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  })
);

/**
 * Convenience component for showing simple dialogs which can be confirmed and/or rejected.
 * The passed component and title can be as complex as you want, if you want however incorporate your own logic into a dialog it might be more
 * reasonable to create an own dialog for your purposes.
 *
 * @param dialogTitle
 * @param dialogContent
 * @param buttonConfirmText
 * @param buttonCancelText
 * @param onClose
 * @param danger
 * @param remainderDialogProps
 * @constructor
 */
export function ConfirmationDialog({dialogTitle, dialogContent, buttonConfirmText, buttonCancelText, onClose, danger = false, ...remainderDialogProps}: ConfirmationDialogProps) {

  const handleCloseInternal = async (confirmed: boolean) => {
    onClose(confirmed);
  };

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const buttonFlexDirection = isSmallDevice ? "column" : "row";
  const dialogClasses = useConfirmationDialogStyles();

  return (
    <Dialog
      open={true}
      onClose={() => handleCloseInternal(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...remainderDialogProps}>
      
        {dialogTitle && <DialogTitleCloseable onClose={() => handleCloseInternal(false)}>{dialogTitle}</DialogTitleCloseable> }

      <DialogContent>
        {dialogContent && (
          <DialogContentText id="alert-dialog-description">{dialogContent}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions className={isSmallDevice ? dialogClasses.dialogActions : ""}>
        <Box px={2} pt={1} pb={2}>
          <Grid container justify="flex-end" direction={buttonFlexDirection} alignContent="center">
            <Grid item style={{ alignSelf: "center" }}>
              {buttonCancelText && (
                <Button onClick={() => handleCloseInternal(false)}>{buttonCancelText}</Button>
              )}
            </Grid>
            <Grid item style={{ alignSelf: "center" }}>
              {
                danger ? <SpacingButton ml={isSmallDevice ? 0 : 1}
                                        color="secondary"
                                        variant="contained"
                                        onClick={() => handleCloseInternal(true)}
                                        autoFocus>
                                {buttonConfirmText}
                          </SpacingButton>
                : <PrimaryButton ml={isSmallDevice ? 0 : 1}
                                 variant="contained"
                                 onClick={() => handleCloseInternal(true)}
                                 autoFocus>
                    {buttonConfirmText}
                  </PrimaryButton>
              }
            </Grid>
          </Grid>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
