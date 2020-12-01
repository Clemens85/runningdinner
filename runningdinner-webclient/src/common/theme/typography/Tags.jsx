import {Box, Divider, Typography} from "@material-ui/core";
import React from "react";
import omit from 'lodash/omit';
import {isStringEmpty} from "../../../shared/Utils";
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
  return (
      <>
        <Box component={"div"} mt={4} mb={4}>
          <Typography variant="h4" color={"primary"}>{props.children}</Typography>
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

  if (isStringEmpty(i18n)) {
    return <Typography variant={variant} gutterBottom>{ props.children }</Typography>;
  }

  const parameters = props.parameters ? props.parameters : {};

  // Remove those special params due they might cause JS console errors
  const normalizedProps = omit(props, ['html', 'ns', 'i18n', 'parameters']);
      //cloneDeep(props);
  // delete normalizedProps.html;
  // delete normalizedProps.ns;
  // delete normalizedProps.i18n;
  // delete normalizedProps.parameters;

  if (props.html === true) {
    return <Typography variant={variant} gutterBottom {...normalizedProps}><HtmlTranslate i18n={i18n} parameters={parameters} ns={ns} /></Typography>;
  } else {
    return <Typography variant={variant} gutterBottom {...normalizedProps}>{t(i18n, parameters)}</Typography>;
  }
}

export { SmallTitle, Subtitle, PageTitle, Title, Span };


