import React, {useRef, useState} from 'react'
import Box from "@material-ui/core/Box";
import MessageTemplates from "admin/messages/MessageTemplates";
import { useFormContext } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import debounce from 'lodash/debounce';

export default function MessageContent({templates, onMessageContentChange}) {

  console.log('Rendering MessageContent');

  const { setValue, register } = useFormContext();
  // const [internalMessageContent, setInternalMessageContent] = useState('');

  const contentRef = useRef();
  const [cursorPosition, setCursorPosition] = useState(-1);

  function handleTemplateClick(template) {

    const currentMessageContent = contentRef.current.value;

    let updatedValue;
    if (cursorPosition < 0) {
      updatedValue = currentMessageContent + template;
      setCursorPosition(updatedValue.length);
      // setValue('message', updatedValue);
      // setInternalMessageContent(updatedValue);
      return;
    } else {
      let textBeforeCursorPosition = currentMessageContent.substring(0, cursorPosition);
      let textAfterCursorPosition = currentMessageContent.substring(cursorPosition, currentMessageContent.length);
      updatedValue = textBeforeCursorPosition + template + textAfterCursorPosition;
      setCursorPosition(cursorPosition + template.length);
    }

    setValue('message', updatedValue);
    onMessageContentChange(updatedValue);
    // setInternalMessageContent(updatedValue);
  }

  const handleMessageContentChange = changeEvt => {
    const changedValue = changeEvt.target.value;
    // updateInternalMessageContentStateAsync(changedValue);
    onMessageContentChange(changedValue);
  };

  // const updateInternalMessageContentStateAsync = debounce(newVal => setInternalMessageContent(newVal), 100);

  const handlePositionUpdate = debounce(() => {
    const updatedCursorPosition = contentRef.current.selectionStart;
    setCursorPosition(updatedCursorPosition);
  }, 100);

  return (
      <Box mt={3}>

        <MessageTemplates templates={templates} onTemplateClick={handleTemplateClick}/>

        <TextField  inputRef={(ref) => {
          register(ref);
          contentRef.current = ref;
        }}
                    fullWidth
                    onClick={handlePositionUpdate}
                    onKeyDown={handlePositionUpdate}
                    onChange={handleMessageContentChange}
                    required
                    variant="filled"
                    multiline
                    rows={7}
                    name="message"
                    label="Nachricht" />
      </Box>
  );

}
