import React from "react";
import {useTranslation} from "react-i18next";

function ValueTranslate(props) {

  const {t} = useTranslation(props.ns);

  let value = props.value.toLowerCase();

  if (props.valueMapping[value] || props.valueMapping[props.value]) {
    value = props.valueMapping[value];
    if (!value) {
      value = props.valueMapping[props.value];
    }
  }

  const i18nKey = props.prefix.toLowerCase() + '_' + value;

  return (
      <>{t(i18nKey)}</>
  );
}
ValueTranslate.defaultProps = {
  value: '',
  prefix: '',
  ns: 'common',
  valueMapping: {}
};
export default ValueTranslate;