import React from 'react'
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Subtitle} from "../../common/theme/typography/Tags";

export default function Checklist() {
  return (
      <Card>
        <CardContent>
          <Subtitle>Checkliste</Subtitle>
          <div>
            TODO
          </div>
        </CardContent>
      </Card>
  );

}
