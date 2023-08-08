import {LocalDate} from "@runningdinner/shared";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React from "react";
import { Avatar, CardHeader } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {NewsItem} from "./NewsItemsHook";
import { useLandingStyles } from "../LandingStyles";
import AssignmentIcon from '@mui/icons-material/Assignment';

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