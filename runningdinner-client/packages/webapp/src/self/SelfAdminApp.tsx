import React from 'react'
import { Container } from "@mui/material";
import {Provider} from 'react-redux';
import {
  getSelfAdminFetchDataErrorSelector,
  isFetchingSelfAdminDataSelector,
  useSelfAdminSelector,
} from "@runningdinner/shared";
import { SelfAdminRoute } from './SelfAdminRoute';
import {selfAdminStore} from "@runningdinner/shared";
import { ProgressBar } from '../common/ProgressBar';

export default function SelfAdminApp() {

  return (
    <Provider store={selfAdminStore}>
      <SelfAdminAppPage />
    </Provider>
  )
}

function SelfAdminAppPage() {

  const showLoadingProgress = useSelfAdminSelector(isFetchingSelfAdminDataSelector);
  const fetchError = useSelfAdminSelector(getSelfAdminFetchDataErrorSelector);

  return (
    <div>
      <ProgressBar fetchError={fetchError} showLoadingProgress={showLoadingProgress} />
      <Container maxWidth="xl">
        <SelfAdminRoute />
      </Container>
    </div>
  );
}
