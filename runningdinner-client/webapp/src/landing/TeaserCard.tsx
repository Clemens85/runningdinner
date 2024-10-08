import {Parent} from "@runningdinner/shared";
import CardContent from "@mui/material/CardContent";
import {Subtitle} from "../common/theme/typography/Tags";
import React from "react";
import {CardFlexibleHeight} from "./LandingStyles";

export interface TeaserCardProps extends Parent {
  titleI18nKey: string;
}

export function TeaserCard({children, titleI18nKey}: TeaserCardProps) {

  return (
    <CardFlexibleHeight>
      <CardContent>
        <Subtitle i18n={titleI18nKey} />
        <div>
          { children }
        </div>
      </CardContent>
    </CardFlexibleHeight>
  );
}