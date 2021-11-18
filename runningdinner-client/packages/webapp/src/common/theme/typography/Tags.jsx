import {Box, Divider, Typography} from "@material-ui/core";
import React from "react";
import omit from 'lodash/omit';
import {isStringEmpty} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import HtmlTranslate from "../../i18n/HtmlTranslate";

const SmallTitle = (props) => {
  return (
    <TypographyWrapper {...props} variant={"subtitle2"}/>
  );
};

const Title = (props) => {
  return (
      <TypographyWrapper {...props} variant={"h6"}/>
  );
};

const Subtitle = (props) => {
  return (
      <TypographyWrapper {...props} variant={"h5"} />
  );
};

const Span = (props) => {
  return (
    <TypographyWrapper {...props} variant={"body2"} />
  );
};

const PageTitle = (props) => {

  let color = "primary";
  if (props.color) {
    color = props.color;
  }

  let mtToUse = props.mt ? props.mt : 2;
  if (props.mt === 0) {
    mtToUse = 0;
  }

  return (
      <>
        <Box component={"div"} mt={mtToUse} mb={4}>
          <Typography variant="h4" color={color}>{props.children}</Typography>
          <Divider />
        </Box>
      </>
  );
};

function TypographyWrapper(props) {

  let i18n = props.i18n ? props.i18n : '';
  let ns = 'common';
  if (i18n.indexOf(':') !== -1) {
    const i18nParts = i18n.split(':');
    ns = i18nParts[0];
    i18n = i18nParts[1];
  }

  const { variant } = props;

  const {t} = useTranslation(ns);

  const gutterBottom = typeof props.gutterBottom !== 'undefined' ? props.gutterBottom : true;

  if (isStringEmpty(i18n)) {
    return <Typography variant={variant} gutterBottom={gutterBottom}>{ props.children }</Typography>;
  }

  const parameters = props.parameters ? props.parameters : {};

  // Remove those special params due they might cause JS console errors
  const normalizedProps = omit(props, ['html', 'ns', 'i18n', 'parameters', 'gutterBottom']);

  if (props.html === true) {
    return <Typography variant={variant} gutterBottom={gutterBottom} {...normalizedProps}><HtmlTranslate i18n={i18n} parameters={parameters} ns={ns} /></Typography>;
  } else {
    return <Typography variant={variant} gutterBottom={gutterBottom} {...normalizedProps}>{t(i18n, parameters)}</Typography>;
  }
}

export { SmallTitle, Subtitle, PageTitle, Title, Span };


