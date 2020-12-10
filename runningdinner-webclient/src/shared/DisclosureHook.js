import {useState} from "react";

export function useDisclosure(initialOpenStatus, initialData) {

  const [disclosureState, setDisclosureState] = useState({
    open: initialOpenStatus || false,
    data: initialData
  });

  function open(optionalIsOpenParameter) {
    setDisclosureState({
      open: true,
      data: optionalIsOpenParameter ? optionalIsOpenParameter : null
    });
  }

  function close() {
    setDisclosureState({
      open: false,
      data: null
    });
  }

  return { isOpen: !!disclosureState.open,
          open,
          close,
          data: disclosureState.data };

}
