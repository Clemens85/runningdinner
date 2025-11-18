import { Link } from '@mui/material';
import { RunningDinner } from '@runningdinner/shared';
import React from 'react';

export function PublicRunningDinnerLink({ publicSettings }: RunningDinner) {
  return (
    <Link href={publicSettings.publicDinnerUrl} target="_blank" underline="hover">
      {publicSettings.publicDinnerUrl}
    </Link>
  );
}
