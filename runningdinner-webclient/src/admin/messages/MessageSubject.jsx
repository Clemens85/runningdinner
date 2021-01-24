import React from 'react'
import Box from "@material-ui/core/Box";
import {useTranslation} from "react-i18next";
import TextInputWatchable from "../../common/input/TextInputWatchable";

export default function MessageSubject({onMessageSubjectChange}) {

  const {t} = useTranslation('admin');

  return (
      <Box mt={1}>
        <TextInputWatchable onChange={onMessageSubjectChange}
                            fullWidth
                            required
                            variant="filled"
                            name="subject"
                            label={t("mails_subject")} />
      </Box>
  );

}
