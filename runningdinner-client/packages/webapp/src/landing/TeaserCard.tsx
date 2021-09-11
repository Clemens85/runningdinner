import {Parent} from "@runningdinner/shared";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Subtitle} from "../common/theme/typography/Tags";
import React from "react";

export interface TeaserCardProps extends Parent {
  titleI18nKey: string;
}

export function TeaserCard({children, titleI18nKey}: TeaserCardProps) {
  return (
    <Card style={{ height: '100%' }}>
      <CardContent>
        <Subtitle i18n={titleI18nKey} />
        <div>
          { children }
        </div>
      </CardContent>
    </Card>
  );
}