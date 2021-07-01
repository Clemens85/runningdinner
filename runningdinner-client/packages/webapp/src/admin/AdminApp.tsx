import React from 'react'
import { useRouteMatch, useParams } from "react-router-dom";
import { Container } from "@material-ui/core";
import {AdminMenu} from "./AdminMenu";
import {AdminRoute} from "./AdminRoute";
import {Provider, useDispatch} from 'react-redux';
import {
  adminStore, BaseAdminIdProps,
  fetchRunningDinner,
} from "@runningdinner/shared";
import {AdminProgressBar} from "./AdminProgressBar";
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

  const {path, url} = useRouteMatch();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchRunningDinner(adminId));
  }, [dispatch, adminId]);

  return (
      <div>
        <AdminMenu url={url} />
        <AdminProgressBar />
        <Container maxWidth="xl">
          <AdminRoute path={path} />
        </Container>
      </div>
  );
};

export default AdminApp;
