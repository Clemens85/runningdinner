import React, {useRef, useState} from 'react'
import Box from "@material-ui/core/Box";
import MessageTemplates from "./MessageTemplates";
import { useFormContext } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import debounce from 'lodash/debounce';

export interface MessageContentProps {
  templates: string[];
  onMessageContentChange: (changedVal: string) => unknown;
  name: string;
  label: string;
  rows?: number;
  helperText?: string;
}

export default function MessageContent({templates, onMessageContentChange, name, label, rows, helperText}: MessageContentProps) {

  const { setValue, register } = useFormContext();

  const contentRef = useRef();
  const [cursorPosition, setCursorPosition] = useState(-1);

  function handleTemplateClick(template: string) {

    // @ts-ignore
    const currentMessageContent = contentRef?.current?.value;

    let updatedValue;
    if (cursorPosition < 0) {
      updatedValue = currentMessageContent + template;
      setCursorPosition(updatedValue.length);
      return;
    } else {
      let textBeforeCursorPosition = currentMessageContent.substring(0, cursorPosition);
      let textAfterCursorPosition = currentMessageContent.substring(cursorPosition, currentMessageContent.length);
      updatedValue = textBeforeCursorPosition + template + textAfterCursorPosition;
      setCursorPosition(cursorPosition + template.length);
    }

    setValue(name, updatedValue);
    onMessageContentChange(updatedValue);
  }

  const handleMessageContentChange = (changeEvt: React.ChangeEvent<HTMLInputElement>) => {
    const changedValue = changeEvt.target.value;
    onMessageContentChange(changedValue);
  };


  const handlePositionUpdate = debounce(() => {
    // @ts-ignore
    const updatedCursorPosition = contentRef?.current?.selectionStart;
    setCursorPosition(updatedCursorPosition);
  }, 100);

  return (
      <Box mt={3}>

        <MessageTemplates templates={templates} onTemplateClick={handleTemplateClick}/>

        <TextField inputRef={(ref) => {
                                register(ref);
                                contentRef.current = ref;
                            }}
          fullWidth
          onClick={handlePositionUpdate}
          onKeyDown={handlePositionUpdate}
          onChange={handleMessageContentChange}
          required
          variant="filled"
          helperText={helperText}
          multiline
          rows={rows}
          name={name}
          label={label} />
      </Box>
  );

}
