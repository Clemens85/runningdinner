import { Box } from '@mui/material';
import { BasePublicDinnerProps, RunningDinnerType } from '@runningdinner/shared';

import AlertCentered from '../common/theme/AlertCentered';
import Paragraph from '../common/theme/typography/Paragraph';

export function PublicDemoDinnerEventNotification({ publicRunningDinner }: BasePublicDinnerProps) {
  const isDemoEvent = publicRunningDinner.runningDinnerType === RunningDinnerType.DEMO;

  return (
    <>
      {isDemoEvent && (
        <Box mt={1}>
          <AlertCentered severity={'info'} icon={false}>
            <Paragraph i18n={'landing:notification_demo_no_registration_text'} />
          </AlertCentered>
        </Box>
      )}
    </>
  );
}
