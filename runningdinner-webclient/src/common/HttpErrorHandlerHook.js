import {useSnackbar} from "notistack";
import {mapIssuesToErrorObjects, mapValidationIssuesToErrorObjects} from "shared/Utils";
import React from 'react';
import {useTranslation} from "react-i18next";

function useHttpErrorHandler() {

  const {enqueueSnackbar} = useSnackbar();
  const {t} = useTranslation('common');

  const [allErrors, setAllErrors] = React.useState([]);
  const [validationErrors, setValidationErrors] = React.useState([]);

  function handleError(e, showErrorNotification = true) {
    handleErrorsInternal(e, false, showErrorNotification);
  }

  function handleFormValidationErrors(e) {
    handleErrorsInternal(e, true, true);
  }

  function handleErrorsInternal(e, formValidationIssuesExpected, showErrorNotification) {
    const allErrors = mapIssuesToErrorObjects(e);
    const validationErrors = mapValidationIssuesToErrorObjects(e);
    setAllErrors(allErrors);
    setValidationErrors(validationErrors);
    if (formValidationIssuesExpected && validationErrors.length > 0) {
      enqueueSnackbar(t("common:validation_error_desc"), {variant: "error"});
    } else if (showErrorNotification) {
      allErrors.map(error => enqueueSnackbar(error.message, {variant: "error"}));
    }
  }

  return { handleError, handleFormValidationErrors, allErrors, validationErrors };
}

export default useHttpErrorHandler;



