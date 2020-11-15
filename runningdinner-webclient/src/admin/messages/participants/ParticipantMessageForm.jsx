import React from "react";
import MessageHeadline from "../MessageHeadline";
import { Box, LinearProgress, Grid } from "@material-ui/core";
import {PrimaryButton} from "../../../common/theme/PrimaryButton";
import {useTranslation} from "react-i18next";

export default function ParticipantMessageForm({recipientsControl, messageSubjectControl, messageContentControl, isSubmitting, submitForm}) {

  const {t} = useTranslation('admin');

  return (
      <Grid container>
        <Grid item xs={12}>
          <MessageHeadline />
        </Grid>

        <Grid item xs={12}>

          { recipientsControl }
          { messageSubjectControl }
          { messageContentControl }

          {isSubmitting && <LinearProgress />}

          <Grid container justify={"flex-end"}>
            <Grid item>
              <Box mt={3}>
                <PrimaryButton onClick={submitForm} disabled={isSubmitting} size={"large"}>{t('messages_send_general')}</PrimaryButton>
              </Box>
            </Grid>
          </Grid>

        </Grid>
      </Grid>
  );

}
