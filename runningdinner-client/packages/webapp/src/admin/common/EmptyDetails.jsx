import {useTranslation} from "react-i18next";
import {Grid, Hidden, Paper, Typography} from "@material-ui/core";
import React, {useRef} from "react";
import {useDynamicFullscreenHeight} from "../../common/hooks/DynamicFullscreenHeightHook";

export const EmptyDetails = ({labelI18n}) => {

  const {t} = useTranslation('admin');

  const paperRef = useRef(null);
  const paperHeight = useDynamicFullscreenHeight(paperRef, 300);

  return (
      <div ref={paperRef}>
        <Hidden smDown>
            <Paper style={{height: paperHeight }} elevation={3}>
              <Grid container justify={"center"} alignItems={"center"}>
                <Grid item>
                  <Typography variant="subtitle2" style={{marginTop: '50%'}}>{t(labelI18n)}</Typography>
                </Grid>
              </Grid>
            </Paper>
        </Hidden>
      </div>
  );
};
