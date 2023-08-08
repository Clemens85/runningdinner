import React from 'react';
import {RunningDinner} from "@runningdinner/shared";
import {Link} from "@mui/material";

export function PublicRunningDinnerLink({publicSettings}: RunningDinner) {
  return <Link href={publicSettings.publicDinnerUrl} target="_blank">{publicSettings.publicDinnerUrl}</Link>;
}
