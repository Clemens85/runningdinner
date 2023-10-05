import React, {useRef} from 'react'
import Box from "@mui/material/Box";
import MessageTemplates from "./MessageTemplates";
import { useFormContext } from "react-hook-form";
import TextField from "@mui/material/TextField";

export interface MessageContentProps {
  templates?: string[];
  showTemplatesHelpIcon: boolean;
  onMessageContentChange?: (changedVal: string) => unknown;
  name: string;
  label: string;
  rows?: number;
  helperText?: string;
}

export default function MessageContent({templates, onMessageContentChange, name, label, rows, helperText, showTemplatesHelpIcon}: MessageContentProps) {

  const { setValue, register, errors } = useFormContext();

  const contentRef = useRef();

  function handleTemplateClick(template: string) {

    const inputField = getInputField();
    if (!inputField) {
      return;
    }

    const currentMessageContent = inputField.value;
    const cursorPosition = getCurrentCursorPosition();

    let newCursorPosition;

    let updatedValue;
    if (cursorPosition < 0) {
      updatedValue = currentMessageContent + template;
      newCursorPosition = updatedValue.length;
    } else {
      let textBeforeCursorPosition = currentMessageContent.substring(0, cursorPosition);
      let textAfterCursorPosition = currentMessageContent.substring(cursorPosition, currentMessageContent.length);
      updatedValue = textBeforeCursorPosition + template + textAfterCursorPosition;
      newCursorPosition = template.length + cursorPosition;
    }

    setValue(name, updatedValue);
    onMessageContentChange && onMessageContentChange(updatedValue);

    inputField.focus();
    inputField.selectionEnd = newCursorPosition; // Add one space, so that user can straight continue typing
  }

  const handleMessageContentChange = (changeEvt: React.ChangeEvent<HTMLInputElement>) => {
    const changedValue = changeEvt.target.value;
    onMessageContentChange && onMessageContentChange(changedValue);
  };

  /**
   * Returns -1 if cursor is not set in inputField or inputField has no focus, otherwise the current cursor position
   */
  const getCurrentCursorPosition = (): number => {
    const inputField = getInputField();
    if (!inputField) {
      return -1;
    }
    return /*inputField === document.activeElement && */inputField.selectionStart !== null ? inputField.selectionStart : -1;
  };

  const getInputField = (): HTMLInputElement | undefined => {
    if (contentRef && contentRef.current) {
      // @ts-ignore
      return contentRef.current as HTMLInputElement;
    }
    return undefined;
  };


  const hasErrors = !!errors[name];
  const helperTextToDisplay = hasErrors ? errors[name].message : helperText;

  return (
      <Box mt={3}>

        <MessageTemplates templates={templates}
                          onTemplateClick={handleTemplateClick}
                          showTemplatesHelpIcon={showTemplatesHelpIcon} />

        <TextField inputRef={(ref) => {
                                register(ref);
                                contentRef.current = ref;
                            }}
          fullWidth
          onChange={handleMessageContentChange}
          required
          variant="outlined"
          helperText={helperTextToDisplay}
          error={hasErrors}
          multiline
          rows={rows}
          name={name}
          label={label} />
      </Box>
  );

}
