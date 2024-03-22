import React from 'react'
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";
import AdminMenu from "./AdminMenu";
import AdminRoute from "./AdminRoute";
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
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import useDatePickerLocale from "../common/date/DatePickerLocaleHook";
import { FameOnMePopup } from '../common/teaserpopup/FameOnMePopup';

export default function AdminApp() {

  const { locale } = useDatePickerLocale();
  const {adminId} = useParams<Record<string, string>>();

  if (!adminId) {
    return null; // TODO
  }

  return (
    <Provider store={adminStore}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <AdminAppPage adminId={adminId} />
      </LocalizationProvider>
    </Provider>
  )
}

function AdminAppPage({adminId}: BaseAdminIdProps) {

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
        <Container maxWidth={false}>
          <AdminRoute />
          <FameOnMePopup />
        </Container>
      </div>
  );
}
