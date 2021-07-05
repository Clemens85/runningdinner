import React from 'react';
import {RunningDinner} from "@runningdinner/shared";
import {Link} from "@material-ui/core";

export function PublicRunningDinnerLink({publicSettings}: RunningDinner) {
  return <Link href={publicSettings.publicDinnerUrl} target="_blank">{publicSettings.publicDinnerUrl}</Link>;
}
