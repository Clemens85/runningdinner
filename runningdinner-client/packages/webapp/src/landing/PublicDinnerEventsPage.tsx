import React from 'react';
import {PageTitle, Subtitle} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {Fetch} from "../common/Fetch";
import {findPublicRunningDinnersAsync, isArrayNotEmpty, PublicRunningDinner} from "@runningdinner/shared";
import {Grid} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

export function PublicDinnerEventsPage() {

  const {t} = useTranslation(["landing", "common"]);

  return <Fetch asyncFunction={findPublicRunningDinnersAsync}
                parameters={[]}
                render={publicRunningDinners =>
                    <div>
                      <PageTitle>{t('landing:public_dinner_events_headline')}</PageTitle>
                      { isArrayNotEmpty(publicRunningDinners.result) ? <PublicDinnerEventsListPage publicRunningDinners={publicRunningDinners.result} />
                                                                     : <NoPublicDinnerEventsPage /> }
                    </div>
                } />;
}

export interface PublicDinnerEventsListProps {
  publicRunningDinners: PublicRunningDinner[];
}

function PublicDinnerEventsListPage({publicRunningDinners}: PublicDinnerEventsListProps) {

  function renderPublicDinnerEventCard() {
    return (
      <Grid item xs={12} md={6}>
        <Card style={{ height: '100%' }}>
          <CardContent>
            <Subtitle i18n={titleI18nKey} />
            <div>
              { children }
            </div>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <div>
      <Grid container spacing={6}>

      </Grid>
    </div>
  );
}

function NoPublicDinnerEventsPage() {
  return (
    <div>
      No Dinner
    </div>
  );
}