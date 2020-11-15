import React from 'react'
import Box from "@material-ui/core/Box";
import TextInputWatchable from "../../common/input/TextInputWatchable";

export default function MessageSubject({onMessageSubjectChange}) {

  return (
      <Box mt={1}>
        <TextInputWatchable onChange={onMessageSubjectChange}
                            fullWidth
                            required
                            variant="filled"
                            name="subject"
                            label="Betreff" />
      </Box>
  );

}
