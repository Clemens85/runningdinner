import React from 'react'
import { useRouteMatch } from "react-router-dom";
import { Container } from "@material-ui/core";
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
      <SelfAdminAppContent />
    </Provider>
  )
}

function SelfAdminAppContent() {

  const {path} = useRouteMatch();

  const showLoadingProgress = useSelfAdminSelector(isFetchingSelfAdminDataSelector);
  const fetchError = useSelfAdminSelector(getSelfAdminFetchDataErrorSelector);

  return (
    <div>
      <ProgressBar fetchError={fetchError} showLoadingProgress={showLoadingProgress} />
      <Container maxWidth="xl">
        <SelfAdminRoute path={path} />
      </Container>
    </div>
  );
}