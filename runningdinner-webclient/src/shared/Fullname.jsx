import React from "react";
import ParticipantService from "./admin/ParticipantService";

export default function Fullname(props) {

  const fullname = ParticipantService.getFullname(props);
  return (
      <>{fullname}</>
  );
}
