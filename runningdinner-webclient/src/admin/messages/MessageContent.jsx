import React, {useRef, useState} from 'react'
import Box from "@material-ui/core/Box";
import MessageTemplates from "./MessageTemplates";
import { useFormContext } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import debounce from 'lodash/debounce';

export default function MessageContent({templates, onMessageContentChange}) {

  // https://medium.com/javascript-in-plain-english/react-refs-both-class-and-functional-components-76b7bce487b8
  // https://stackoverflow.com/questions/40909902/shouldcomponentupdate-in-function-components
  // https://www.codementor.io/blog/react-optimization-5wiwjnf9hj
  // https://kentcdodds.com/blog/optimize-react-re-renders
  // https://github.com/jaredpalmer/formik/issues/342

  console.log('Rendering MessageContent');

  const { setValue, register } = useFormContext();
  const [cursorPosition, setCursorPosition] = useState(-1);
  const [internalMessageContent, setInternalMessageContent] = useState('');
  const contentRef = useRef();

  function handleTemplateClick(template) {

    if (cursorPosition < 0) {
      const updatedValue = contentRef.current.value + template;
      setCursorPosition(updatedValue.length);
      setValue('message', updatedValue);
      setInternalMessageContent(updatedValue);
      return;
    }

    let textBeforeCursorPosition = internalMessageContent.substring(0, cursorPosition);
    let textAfterCursorPosition = internalMessageContent.substring(cursorPosition, internalMessageContent.length);
    const updatedValue = textBeforeCursorPosition + template + textAfterCursorPosition;

    setCursorPosition(cursorPosition + template.length);
    setValue('message', updatedValue);
    setInternalMessageContent(updatedValue);
  }

  const handleMessageContentChange = changeEvt => {
    const changedValue = changeEvt.target.value;
    updateInternalMessageContentStateAsync(changedValue);
    onMessageContentChange(changedValue);
  };

  const updateInternalMessageContentStateAsync = debounce(newVal => setInternalMessageContent(newVal), 100);

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
