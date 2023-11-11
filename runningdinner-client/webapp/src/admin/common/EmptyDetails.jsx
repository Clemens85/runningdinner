import {useTranslation} from "react-i18next";
import {Grid, Paper, Typography} from "@mui/material";
import React, {useRef} from "react";
import {useDynamicFullscreenHeight} from "../../common/hooks/DynamicFullscreenHeightHook";
import {useMasterDetailView} from "../../common/hooks/MasterDetailViewHook";

export const EmptyDetails = ({labelI18n}) => {

  const {t} = useTranslation('admin');

  const paperRef = useRef(null);
  const paperHeight = useDynamicFullscreenHeight(paperRef, 300);

  const {showDetailsView} = useMasterDetailView();

  return (
    <div ref={paperRef}>
      { showDetailsView && 
          <Paper style={{height: paperHeight, display: 'flex' }} elevation={3}>
            <Grid container justifyContent={"center"} alignItems={"center"}>
              <Grid item>
                <Typography variant="subtitle2" sx={{ px: 2 }}>{t(labelI18n)}</Typography>
              </Grid>
            </Grid>
          </Paper>
      }
    </div>
  );
};
