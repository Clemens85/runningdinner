import { useState } from 'react';
import {isClient} from "@runningdinner/shared";
import useEventListener from "./EventListenerHook";

function useWindowSize(initialWidth, initialHeight) {
  const [windowSize, setWindowSize] = useState({
    width: isClient ? window.innerWidth : initialWidth,
    height: isClient ? window.innerHeight : initialHeight,
  });

  useEventListener('resize', () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  return windowSize;
}

export default useWindowSize;
