import React from 'react'
import { useRouteMatch, useParams } from "react-router-dom";
import { Container } from "@material-ui/core";
import {AdminContextProvider} from "./AdminContext";
import {AdminMenu} from "./AdminMenu";
import {AdminRoute} from "./AdminRoute";

const AdminApp = () =>  {

  const {adminId} = useParams<Record<string, string>>();

  return (
    <AdminContextProvider adminId={adminId}>
      <AdminAppContent />
    </AdminContextProvider>
  )
};

const AdminAppContent = () => {

  const {path, url} = useRouteMatch();

  return (
      <div>
        <AdminMenu url={url} />
        <Container maxWidth="xl">
          <AdminRoute path={path} />
        </Container>
      </div>
  );
};

export default AdminApp;
