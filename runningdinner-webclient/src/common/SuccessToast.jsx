import React, {useState, useEffect} from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

function SuccessToast(props) {

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
        <Alert onClose={handleClose} severity="success">
          {message}
        </Alert>
      </Snackbar>
  );
}
SuccessToast.defaultProps = {
  message: "Daten erfolgreich gespeichert!",
  show: false
};

export default SuccessToast;
