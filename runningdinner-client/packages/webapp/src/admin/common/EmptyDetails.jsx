import {useTranslation} from "react-i18next";
import useWindowSize from "../../common/hooks/WindowSizeHook";
import {Grid, Hidden, Paper, Typography} from "@material-ui/core";
import React from "react";

export const EmptyDetails = ({labelI18n}) => {

  const {t} = useTranslation('admin');

  const { height } = useWindowSize();
  return (
      <Hidden smDown>
        <Paper style={{height: height }} elevation={3}>
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item>
              <Typography variant="subtitle2" style={{marginTop: '50%'}}>{t(labelI18n)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Hidden>
  );
};
