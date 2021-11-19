import React from 'react'
import { useRouteMatch, useParams } from "react-router-dom";
import { Container } from "@material-ui/core";
import {AdminMenu} from "./AdminMenu";
import {AdminRoute} from "./AdminRoute";
import {Provider, useDispatch} from 'react-redux';
import {
  adminStore,
  BaseAdminIdProps,
  fetchRunningDinner,
  getFetchDataErrorSelector,
  isFetchingDataSelector,
  useAdminSelector,
} from "@runningdinner/shared";
import {ProgressBar} from "../common/ProgressBar";
import "../timeline.css";

const AdminApp = () =>  {

  const {adminId} = useParams<Record<string, string>>();

  return (
    <Provider store={adminStore}>
      <AdminAppContent adminId={adminId} />
    </Provider>
  )
};

const AdminAppContent = ({adminId}: BaseAdminIdProps) => {

  const {path} = useRouteMatch();
  const dispatch = useDispatch();

  const showLoadingProgress = useAdminSelector(isFetchingDataSelector);
  const fetchError = useAdminSelector(getFetchDataErrorSelector);

  React.useEffect(() => {
    dispatch(fetchRunningDinner(adminId));
  }, [dispatch, adminId]);

  return (
      <div>
        <AdminMenu />
        <ProgressBar showLoadingProgress={showLoadingProgress} fetchError={fetchError} />
        <Container maxWidth="xl">
          <AdminRoute path={path} />
        </Container>
      </div>
  );
};

export default AdminApp;
