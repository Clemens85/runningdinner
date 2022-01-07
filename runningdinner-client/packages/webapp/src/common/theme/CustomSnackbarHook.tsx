import { OptionsObject, useSnackbar, VariantType } from "notistack";
import React, { ReactNode } from "react";
import IconButton from "@material-ui/core/IconButton";
import { CloseRounded } from "@material-ui/icons";

export interface CustomSnackbarOptions extends OptionsObject {
  showCloseButton?: boolean;
  wrapInHtmlContainer?: boolean;
}

/**
 * Simple hook for showing notification toasts (also known as snackbars).<br/>
 *
 * @example
 * const {showSuccess} = useCustomSnackbar();
 * ...
 * showSuccess('My Message'); // Shows this message with default settings (with close-Icon, auto disappearing after 5 seconds)
 * showSuccess('My Message'); // This message won't be shown due to the default settings automatically prevents duplicated snackbars
 * <br/>
 * @example
 * const {showSuccess} = useCustomSnackbar();
 * ...
 * // Shows two snackbar instances (due to preventDuplicate is set to false) which must be manually closed due to they won't disappear automatically
 * showSuccess('My Message', { preventDuplicate: false, autoHideDuration: null });
 * showSuccess('My Message', { preventDuplicate: false, autoHideDuration: null });
 * <br/>
 * @example
 * const {showSuccess} = useCustomSnackbar();
 * ...
 * // This snackbar has no close-icon and disappears automatically after 5 seconds
 * showSuccess('My Message', { showCloseButton: false });
 *
 */
export function useCustomSnackbar() {
  const { enqueueSnackbar } = useSnackbar();

  function showSuccess(message: ReactNode, options?: CustomSnackbarOptions) {
    enqueueSnackbar(wrapMessageIfNeeded(message, options), newSnackbarOptions("success", options));
  }

  function showError(message: ReactNode, options?: CustomSnackbarOptions) {
    enqueueSnackbar(wrapMessageIfNeeded(message, options), newSnackbarOptions("error", options));
  }

  function showInfo(message: ReactNode, options?: CustomSnackbarOptions) {
    enqueueSnackbar(wrapMessageIfNeeded(message, options), newSnackbarOptions("info", options));
  }

  function showWarning(message: ReactNode, options?: CustomSnackbarOptions) {
    enqueueSnackbar(wrapMessageIfNeeded(message, options),newSnackbarOptions("warning", options));
  }

  function showDefault(message: ReactNode, options?: CustomSnackbarOptions) {
    enqueueSnackbar(wrapMessageIfNeeded(message, options), newSnackbarOptions(undefined, options));
  }

  // function showSuccessHtml(message: ReactNode, options?: CustomSnackbarOptions) {
  //   showSuccess(wrapMessageIfNeeded(message, options), options);
  // }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showDefault,
  };
}

function wrapMessageIfNeeded(message: ReactNode, options?: CustomSnackbarOptions): ReactNode {
  if (options?.wrapInHtmlContainer) {
    return <><div style={{ display: "block" }}>{message}</div></>;
  }
  return message;
}

function newSnackbarOptions(variant?: VariantType, incomingOptions?: CustomSnackbarOptions): CustomSnackbarOptions {
  const options = { ...incomingOptions };
  options.preventDuplicate = options.preventDuplicate !== false;
  options.variant = variant;
  if (options.showCloseButton !== false) {
    options.action = CloseAction;
  }
  return options;
}

function CloseAction(key: string) {
  const { closeSnackbar } = useSnackbar();
  return (
      <>
        <IconButton aria-label="close" onClick={() => closeSnackbar(key)}>
          <CloseRounded style={{ color: 'white' }} />
        </IconButton>
      </>
  );
}
