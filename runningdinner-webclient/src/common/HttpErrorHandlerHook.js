import {useSnackbar} from "notistack";
import {mapIssuesToErrorObjects, mapValidationIssuesToErrorObjects} from "shared/Utils";
import React from 'react';

function useHttpErrorHandler() {

  const {enqueueSnackbar} = useSnackbar();

  const [allErrors, setAllErrors] = React.useState([]);
  const [validationErrors, setValidationErrors] = React.useState([]);

  function handleError(e, showErrorNotification) {
    const allErrors = mapIssuesToErrorObjects(e);
    const validationErrors = mapValidationIssuesToErrorObjects(e);
    setAllErrors(allErrors);
    setValidationErrors(validationErrors);
    if (showErrorNotification) {
      allErrors.map(error => enqueueSnackbar(error.message, {variant: "error"}));
    }
  }

  return { handleError, allErrors, validationErrors, };
}

export default useHttpErrorHandler;



