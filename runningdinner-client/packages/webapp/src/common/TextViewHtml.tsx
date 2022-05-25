import React from 'react';
import parse from "html-react-parser";
import { getTruncatedText } from '@runningdinner/shared';

export interface TextViewHtmlParsedProps {
  text: string;
  limit?: number;
}

export function TextViewHtml({text, limit}: TextViewHtmlParsedProps) {
  
  const textToRender = limit !== undefined && limit > 0 ? getTruncatedText(text, limit) : text;
  return (
    <>{parse(textToRender)}</>
  )
}