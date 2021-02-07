import React from "react";

export interface Disclosure<T> {
  /** Should be used to control the open/closed state of controls (This state is modifed by using the provided open/close methods **/
  isOpen: boolean;

  /**
   * Call this method to open e.g. a dialog<br>
   * @param optionalIsOpenData Optional data that can be passed and can therefore be used to hold the state inside an open-action
   * (the data is available as long the underlying object (e.g. a dialog) is opened)
   */
  open: (optionalIsOpenData?: T) => unknown;

  /**
   * Call this method to close e.g. a dialog. This method automatically sets the isOpen state to false
   * @return Returns the data that was passed in the open() call (or undefined if no data was passed)
   */
  close: () => T | undefined;

  /**
   * Returns the data that was passed in the open() call. If no data was passed, or the close method was called before an exception will be thrown.
   */
  getIsOpenData: () => T;
}

/**
 * Hook that can be used for easier state management for controls like dialogs, notifications, alerts, ... <br />
 * Generally saying: All the time when you need to open a component based upon a user action.<br/><br/>
 *
 * @example
 *   const {
 *   isOpen: isMyDialogOpen,
 *   open: openMyDialog,
 *   close: closeMyDialog,
 *   getIsOpenData: getMyDataForDialog,
 * } = useLxDisclosure<MyData>();
 * // Call openMyDialog(myData?) when you want to open your dialog and pass your data that you want to be accessable during opened phase
 * // Call closeMyDialog() when you want to close your dialog (myData will be cleared then)
 * // Call getIsOpenData() when you want to access your data after you opened your dialog
 * // isOpen === true after you called openMyDialog
 *
 * @param initialOpenStatus Typically not set (and/or false) because a component is typically not initially open, but can be set to true if you want to initially opan a component
 * @param initialData Optional data that can be passd alongside when a component is opened. This can e.g. be usefull when you want to display some content in a dialog when it is opened.
 */
export function useDisclosure<T>(
    initialOpenStatus = false,
    initialData: T | undefined = undefined
): Disclosure<T> {
  const [internalState, setInternalState] = React.useState({
    isOpen: initialOpenStatus || false,
    data: initialData,
  });

  function open(optionalIsOpenData?: any) {
    setInternalState({
      isOpen: true,
      data: optionalIsOpenData,
    });
  }

  function close(): T | undefined {
    const dataInState = internalState.data;
    setInternalState({
      isOpen: false,
      data: undefined,
    });
    return dataInState;
  }

  function getIsOpenData(): T {
    if (internalState.data === undefined) {
      throw new Error(
          "Data can only be accessed if it was provided during open call"
      );
    }
    return internalState.data;
  }

  return {
    isOpen: internalState.isOpen,
    open,
    close,
    getIsOpenData,
  };
}


