import React, {useRef} from 'react'
import Box from "@mui/material/Box";
import MessageTemplates from "./MessageTemplates";
import { Controller, useFormContext } from "react-hook-form";
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

  const { setValue, control, formState: {errors} } = useFormContext();

  const contentRef = useRef();

  function handleTemplateClick(template: string) {

    const inputField = getInputField();
    if (!inputField) {
      return;
    }

    const currentMessageContent = inputField.value;
    const cursorPosition = getCurrentCursorPosition();

    let newCursorPosition: number;

    let updatedValue;
    if (cursorPosition < 0) {
      updatedValue = currentMessageContent + template;
      newCursorPosition = updatedValue.length;
    } else {
      const textBeforeCursorPosition = currentMessageContent.substring(0, cursorPosition);
      const textAfterCursorPosition = currentMessageContent.substring(cursorPosition, currentMessageContent.length);
      updatedValue = textBeforeCursorPosition + template + textAfterCursorPosition;
      newCursorPosition = template.length + cursorPosition;
    }

    setValue(name, updatedValue);
    onMessageContentChange && onMessageContentChange(updatedValue);

    setTimeout(() => {
      inputField.selectionEnd = newCursorPosition; // Add at end of current cursor pos, so that user can straight continue typing
    }, 75); // We need to set this a little bit delayed since React 18, because otherwise it might happen, that our cursor is always at end of TextArea due to focus
    inputField.focus();
  }

  const handleMessageContentChange = (changeEvt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  const helperTextToDisplay = (hasErrors ? errors[name]?.message : helperText) as string;

  return (
      <Box mt={3}>

        <MessageTemplates templates={templates}
                          onTemplateClick={handleTemplateClick}
                          showTemplatesHelpIcon={showTemplatesHelpIcon} />

        <Controller control={control}
                    name={name}
                    render={({field: {onChange, value}}) => (
                      <TextField inputRef={(ref) => { contentRef.current = ref; }}
                                 fullWidth
                                 onChange={changeEvt => { 
                                    onChange(changeEvt);
                                    handleMessageContentChange(changeEvt);
                                 }}
                                 value={value}
                                 required
                                 variant="outlined"
                                 helperText={helperTextToDisplay}
                                 error={hasErrors}
                                 multiline
                                 rows={rows}
                                 name={name}
                                 label={label} />
                      )} />
      </Box>
  );

}
