import {useState} from "react";

export function useDisclosure(initialOpenStatus, initialData) {

  const [openInternal, setOpenInternal] = useState(initialOpenStatus || false);
  const [dataInternal, setDataInternal] = useState(initialData);

  function open(optionalIsOpenParameter) {
    setOpenInternal(true);
    if (optionalIsOpenParameter) {
      setDataInternal(optionalIsOpenParameter);
    } else {
      setDataInternal(null);
    }
  }

  function close() {
    setOpenInternal(false);
    setDataInternal(null);
  }

  return { isOpen: !!openInternal, open, close, data: dataInternal };

}
