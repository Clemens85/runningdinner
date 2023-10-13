import React from 'react'
import OverviewItem from "./OverviewItem";
import { Card, CardContent }  from "@mui/material";
import {useTranslation} from "react-i18next";
import {Subtitle} from "../../common/theme/typography/Tags";
import {getTruncatedText, isClosedDinner, LocalDate, ValueTranslate} from "@runningdinner/shared";
import {PublicRunningDinnerLink} from "./PublicRunningDinnerLink";

export default function Overview({runningDinner}) {

  const {t} = useTranslation('common');

  const visibility = runningDinner.basicDetails.registrationType;
  const visibilityLabel = <ValueTranslate value={visibility} prefix='registration_type' />;

  let publicOerviewItems;
  if (!isClosedDinner(runningDinner)) {
    const publicSettings = runningDinner.publicSettings;
    publicOerviewItems = [
      <OverviewItem key={0} headline={t('public_dinner_link')} content={<PublicRunningDinnerLink {...runningDinner } />} />,
      <OverviewItem key={1} headline={t('public_end_of_registration_date')} content={<LocalDate date={publicSettings.endOfRegistrationDate}></LocalDate>} />,
      <OverviewItem key={2} headline={t('public_title')} content={publicSettings.title} />,
      <OverviewItem key={3} headline={t('public_description')} content={getTruncatedText(publicSettings.description, 80)} />
    ];
  }

  return (
      <Card>
        <CardContent>
          <Subtitle i18n='overview' />
          <div>
            <OverviewItem headline={t('registration_type')} content={visibilityLabel} />
            {publicOerviewItems}
          </div>
        </CardContent>
      </Card>
  );

}
