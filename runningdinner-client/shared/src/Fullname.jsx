import React from "react";
import {getFullname} from "./admin";

function Fullname(props) {
  const fullname = getFullname(props);
  return (
      <>{fullname}</>
  );
}

export {
  Fullname
};
