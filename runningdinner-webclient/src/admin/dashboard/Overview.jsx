import React from 'react'
import OverviewItem from "./OverviewItem";
import RunningDinnerService from "../../shared/admin/RunningDinnerService";
import { Card, CardContent, Link }  from "@material-ui/core";
import {useTranslation} from "react-i18next";
import ValueTranslate from "../../shared/i18n/ValueTranslate";
import {Subtitle} from "common/theme/typography/Tags";
import {LocalDate} from "shared/date/LocalDate";

export default function Overview({runningDinner}) {

  const {t} = useTranslation('common');

  const visibility = runningDinner.basicDetails.registrationType;
  const visibilityLabel = <ValueTranslate value={visibility} prefix='registration_type' />;

  let publicOerviewItems;
  if (!RunningDinnerService.isClosedDinner(runningDinner)) {
    const publicSettings = runningDinner.publicSettings;
    const publicDinnerUrl = <Link href={publicSettings.publicDinnerUrl} target="_blank">{publicSettings.publicDinnerUrl}</Link>;
    publicOerviewItems = [
      <OverviewItem key={0} headline={t('public_dinner_link')} content={publicDinnerUrl}></OverviewItem>,
      <OverviewItem key={1} headline={t('public_end_of_registration_date')} content={<LocalDate date={publicSettings.endOfRegistrationDate}></LocalDate>}></OverviewItem>,
      <OverviewItem key={2} headline={t('public_title')} content={publicSettings.title}></OverviewItem>
    ];
  }

  return (
      <Card>
        <CardContent>
          <Subtitle i18n='overview' />
          <div>
            <OverviewItem headline={t('registration_type')} content={visibilityLabel}></OverviewItem>
            {publicOerviewItems}
          </div>
        </CardContent>
      </Card>
  );

}
