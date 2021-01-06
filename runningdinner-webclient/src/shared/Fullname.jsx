import React from "react";
import ParticipantService from "./admin/ParticipantService";

function Fullname(props) {
  const fullname = ParticipantService.getFullname(props);
  return (
      <>{fullname}</>
  );
}

export {
  Fullname
};
