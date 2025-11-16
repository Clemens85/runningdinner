import '../timeline.css';

import { Container } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { adminStore, BaseAdminIdProps, fetchRunningDinner, getFetchDataErrorSelector, isFetchingDataSelector, useAdminSelector } from '@runningdinner/shared';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import useDatePickerLocale from '../common/date/DatePickerLocaleHook';
import { ProgressBar } from '../common/ProgressBar';
import { TeaserPopup } from '../common/teaserpopup';
import AdminMenu from './AdminMenu';
import AdminRoute from './AdminRoute';

export default function AdminApp() {
  const { locale } = useDatePickerLocale();
  const { adminId } = useParams<Record<string, string>>();

  if (!adminId) {
    return null; // TODO
  }

  return (
    <Provider store={adminStore}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <AdminAppPage adminId={adminId} />
      </LocalizationProvider>
    </Provider>
  );
}

function AdminAppPage({ adminId }: BaseAdminIdProps) {
  const dispatch = useDispatch();

  const showLoadingProgress = useAdminSelector(isFetchingDataSelector);
  const fetchError = useAdminSelector(getFetchDataErrorSelector);

  React.useEffect(() => {
    // @ts-ignore
    dispatch(fetchRunningDinner(adminId));
  }, [dispatch, adminId]);

  return (
    <div>
      <AdminMenu />
      <ProgressBar showLoadingProgress={showLoadingProgress} fetchError={fetchError} />
      <Container maxWidth={false}>
        <AdminRoute />
        <TeaserPopup />
      </Container>
    </div>
  );
}
