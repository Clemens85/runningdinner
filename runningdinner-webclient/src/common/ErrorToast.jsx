import React, {useState, useEffect} from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

function ErrorToast(props) {

  const [manuallyClosed, setManuallyClosed] = useState(false);

  const handleClose = (event, reason) => {
    setManuallyClosed(true);
  };

  useEffect(() => {
    setManuallyClosed(false);
  }, [props.show]);

  const open = props.show && !manuallyClosed;
  const { message } = props;

  return (
      <Snackbar open={open} autoHideDuration={6000} vertical='top' anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {message}
        </Alert>
      </Snackbar>
  );
}
ErrorToast.defaultProps = {
  message: "Es ist ein technischer Fehler aufgetreten!"
};

export default ErrorToast;
