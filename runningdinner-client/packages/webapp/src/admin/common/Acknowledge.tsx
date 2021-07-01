import React from 'react';
import {useAsync} from "react-async-hook";
import {
  acknowledgeRunningDinnerAsync,
  BaseRunningDinnerProps,
  CONSTANTS,
  setUpdatedRunningDinner
} from '@runningdinner/shared';
import {PageTitle, Span} from "../../common/theme/typography/Tags";
import {Alert, AlertTitle} from "@material-ui/lab";
import LinkIntern from "../../common/theme/LinkIntern";
import {Trans, useTranslation} from "react-i18next";
import {LinearProgress} from "@material-ui/core";
import LinkExtern from "../../common/theme/LinkExtern";
import {useParams} from "react-router-dom";
import {useAdminNavigation} from "../AdminNavigationHook";
import {useDispatch} from "react-redux";

export default function Acknowledge({runningDinner}: BaseRunningDinnerProps) {

  const {adminId} = runningDinner;
  const dispatch = useDispatch();

  const {t} = useTranslation('admin');

  const {generateDashboardPath} = useAdminNavigation();

  const urlParams = useParams<Record<string, string>>();
  const {acknowledgeId} = urlParams;

  const {loading, error, result} = useAsync(acknowledgeRunningDinnerAsync, [adminId, acknowledgeId]);

  React.useEffect(() => {
    if (!loading && result) {
      dispatch(setUpdatedRunningDinner(result));
    }
    // eslint-disable-next-line
  }, [loading, error, result]);

  return (
    <>
      <PageTitle>{t('admin:runningdinner_acknowledge_title')}</PageTitle>
      { loading && <LinearProgress color="secondary" />}
      { result && <Alert severity={"success"}>
                    <AlertTitle>{t('admin:runningdinner_acknowledge_congratulation_title')}</AlertTitle>
                    <Span i18n={"admin:runningdinner_acknowledge_congratulation_text"}/>
                    <LinkIntern pathname={generateDashboardPath(adminId)}>{t('admin:goto_dashboard')}</LinkIntern>
                  </Alert> }
      { error && <Alert severity={"error"}>
                    <AlertTitle>{t('admin:runningdinner_acknowledge_error_title')}</AlertTitle>
                    <Span>
                      <Trans i18nKey={"admin:runningdinner_acknowledge_error_text"}
                             values={{adminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL}}
                              // @ts-ignore
                             components={{ anchor: <LinkExtern /> }} />
                    </Span>
                  </Alert> }
    </>
  );
}
