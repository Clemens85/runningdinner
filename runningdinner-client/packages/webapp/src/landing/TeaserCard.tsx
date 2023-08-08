import {Parent} from "@runningdinner/shared";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {Subtitle} from "../common/theme/typography/Tags";
import React from "react";
import {useLandingStyles} from "./LandingStyles";

export interface TeaserCardProps extends Parent {
  titleI18nKey: string;
}

export function TeaserCard({children, titleI18nKey}: TeaserCardProps) {

  const landingStyles = useLandingStyles();

  return (
    <Card className={landingStyles.teaserCard}>
      <CardContent>
        <Subtitle i18n={titleI18nKey} />
        <div>
          { children }
        </div>
      </CardContent>
    </Card>
  );
}