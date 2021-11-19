import {LocalDate} from "@runningdinner/shared";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import React from "react";
import {Avatar, CardHeader, makeStyles} from "@material-ui/core";
import {NewsItem} from "./NewsItemsHook";
import { useLandingStyles } from "../LandingStyles";
import AssignmentIcon from '@material-ui/icons/Assignment';

const useNewsStyles = makeStyles((theme) => ({
  header: {
    paddingBottom: 0
  },
  newsIcon: {
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
  },
}));

export function NewsCard({title, content, date}: NewsItem) {

  const landingStyles = useLandingStyles();
  const newsStyles = useNewsStyles();

  return (
    <Card className={landingStyles.teaserCard}>
      <CardHeader title={title}
                  className={newsStyles.header}
                  avatar={<Avatar className={newsStyles.newsIcon}><AssignmentIcon /></Avatar>}
                  subheader={<LocalDate date={date} />} />
      <CardContent>
        <div>{content}</div>
      </CardContent>
    </Card>
  );
}