import { getTruncatedText, mapNewLineToHtmlLineBreaks, MessageTask } from '@runningdinner/shared';

import { TextViewHtml } from '../../../common/TextViewHtml';

interface MessageContentViewProps {
  messageTask: MessageTask;
  truncateMessageContentToNumChars?: number;
}
export function MessageContentView({ messageTask, truncateMessageContentToNumChars }: MessageContentViewProps) {
  const messageContent = truncateMessageContentToNumChars ? getTruncatedText(messageTask.message.content, truncateMessageContentToNumChars) : messageTask.message.content;
  const messageTeaser = mapNewLineToHtmlLineBreaks(messageContent);
  return (
    <>
      <div>
        <strong>{messageTask.message.subject}</strong>
      </div>
      <div>
        <TextViewHtml text={messageTeaser} />
      </div>
    </>
  );
}
