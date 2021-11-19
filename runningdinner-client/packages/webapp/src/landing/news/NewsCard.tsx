import {LocalDate} from "@runningdinner/shared";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import React from "react";
import {CardHeader, makeStyles} from "@material-ui/core";
import {NewsItem} from "./NewsItemsHook";
import { useLandingStyles } from "../LandingStyles";

const useNewsStyles = makeStyles(() => ({
  header: {
    paddingBottom: 0
  }
}));

export function NewsCard({title, content, date}: NewsItem) {

  const landingStyles = useLandingStyles();
  const newsStyles = useNewsStyles();

  return (
    <Card className={landingStyles.teaserCard}>
      <CardHeader title={title}
                  className={newsStyles.header}
                  subheader={<LocalDate date={date} />} />
      <CardContent>
        <div>{content}</div>
      </CardContent>
    </Card>
  );
}