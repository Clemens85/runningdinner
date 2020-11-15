import {Typography} from "@material-ui/core";
import React from "react";
import {isStringEmpty} from "../../../shared/Utils";
import {useTranslation} from "react-i18next";
import HtmlTranslate from "../../i18n/HtmlTranslate";

export default function Paragraph(props) {

  let i18n = props.i18n ? props.i18n : '';
  let ns = 'common';
  if (i18n.indexOf(':') !== -1) {
    const i18nParts = i18n.split(':');
    ns = i18nParts[0];
    i18n = i18nParts[1];
  }

  const {t} = useTranslation(ns);

  if (isStringEmpty(i18n)) {
    return <Typography variant={"body1"} component="p">{ props.children }</Typography>;
  }

  const parameters = props.parameters ? props.parameters : {};

  if (props.html === true) {
    return <Typography variant={"body1"} component="p"><HtmlTranslate i18n={i18n} parameters={parameters} ns={ns} /></Typography>;
  } else {
    return <Typography variant={"body1"} component="p">{t(i18n, parameters)}</Typography>;
  }

}
