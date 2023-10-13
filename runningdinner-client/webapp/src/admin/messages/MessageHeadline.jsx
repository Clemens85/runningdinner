import React from "react";
import Box from "@mui/material/Box";
import {Subtitle} from "../../common/theme/typography/Tags";

export default function MessageHeadline() {

  return (
      <Box mt={2} mb={1}>
        <Subtitle i18n="admin:mails_message"/>
      </Box>
  );

}
