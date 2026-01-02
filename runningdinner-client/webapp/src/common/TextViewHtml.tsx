import { getTruncatedText } from '@runningdinner/shared';
import parse from 'html-react-parser';

export interface TextViewHtmlParsedProps {
  text: string;
  limit?: number;
}

export function TextViewHtml({ text, limit }: TextViewHtmlParsedProps) {
  const textToRender = limit !== undefined && limit > 0 ? getTruncatedText(text, limit) : text;
  return <>{parse(textToRender)}</>;
}
