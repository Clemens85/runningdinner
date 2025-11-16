import { Container } from '@mui/material';
import { getSelfAdminFetchDataErrorSelector, isFetchingSelfAdminDataSelector, useSelfAdminSelector } from '@runningdinner/shared';
import { selfAdminStore } from '@runningdinner/shared';
import { Provider } from 'react-redux';

import { ProgressBar } from '../common/ProgressBar';
import { TeaserPopup } from '../common/teaserpopup';
import { SelfAdminRoute } from './SelfAdminRoute';

export default function SelfAdminApp() {
  return (
    <Provider store={selfAdminStore}>
      <SelfAdminAppPage />
    </Provider>
  );
}

function SelfAdminAppPage() {
  const showLoadingProgress = useSelfAdminSelector(isFetchingSelfAdminDataSelector);
  const fetchError = useSelfAdminSelector(getSelfAdminFetchDataErrorSelector);

  return (
    <div>
      <ProgressBar fetchError={fetchError} showLoadingProgress={showLoadingProgress} />
      <Container maxWidth={false}>
        <SelfAdminRoute />
        <TeaserPopup />
      </Container>
    </div>
  );
}
