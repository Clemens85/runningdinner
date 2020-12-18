import React from "react";
import {Paper} from "@material-ui/core";
import {useTranslation} from "react-i18next";

function MessageJobsOverview() {

  const {t} = useTranslation('admin');

  return (
      <Paper elevation={3}>
        {t('admin:protocols')}
      </Paper>
  );
}

export {
  MessageJobsOverview
};
