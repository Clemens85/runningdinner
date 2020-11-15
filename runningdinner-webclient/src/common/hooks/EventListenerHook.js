import {useEffect, useRef} from "react";
import {isClient} from "../../shared/Utils";

function useEventListener(eventName, handler, element = isClient ? window : undefined) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
      () => {
        // Make sure element supports addEventListener
        // On
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;

        const eventListener = (event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);

        return () => {
          element.removeEventListener(eventName, eventListener);
        };
      },
      [eventName, element],
  );
}

export default useEventListener;
