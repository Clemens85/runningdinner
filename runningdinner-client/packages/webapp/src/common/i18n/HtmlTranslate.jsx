import React from "react";
import {useTranslation} from "react-i18next";
import parse from 'html-react-parser';

export default function HtmlTranslate(props) {

  const { ns, i18n } = props;
  const parameters = props.parameters ? props.parameters : {};

  const {t} = useTranslation(ns);

  const translatedValue = t(i18n, parameters);

  return (
      <>{parse(translatedValue)}</>
  );
}
