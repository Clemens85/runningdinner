import React from "react";
import {makeStyles, Box, Grid, Chip, Hidden} from "@material-ui/core";
import {HelpIconTooltip} from "../../common/theme/HelpIconTooltip";
import Paragraph from "../../common/theme/typography/Paragraph";
import {useTranslation} from "react-i18next";
import {isArrayEmpty} from "@runningdinner/shared";

const useStyles = makeStyles((theme) => ({
  chip: {
    margin: theme.spacing(0.5),
  }
}));

export interface MessageTemplatesProps {
  onTemplateClick: (template: string) => unknown;
  templates?: string[];
  showTemplatesHelpIcon: boolean;
}

function MessageTemplates({templates, onTemplateClick, showTemplatesHelpIcon}: MessageTemplatesProps) {

  const {t} = useTranslation('admin');

  if (isArrayEmpty(templates)) {
    return null;
  }

  // @ts-ignore
  const messageTemplateNodes = templates.map(template =>
      <Grid item key={template}>
        <MessageTemplate template={template} onClick={onTemplateClick} />
      </Grid>
  );
  return (
      <Grid container alignItems={"center"} justify={"flex-start"}>
        <Hidden xsDown>
          <Grid item>
            <Box component={"span"} pr={1}>{t('mails_template_help')}: </Box>
          </Grid>
        </Hidden>
        {messageTemplateNodes}
        {showTemplatesHelpIcon &&
          <Grid item>
            <HelpIconTooltip title={<Paragraph i18n='admin:mails_template_help_description'/>} placement='right'/>
          </Grid>
        }
      </Grid>
  );
}


interface MessageTemplateProps {
  template: string;
  onClick: (template: string) => unknown;
}
function MessageTemplate({template, onClick}: MessageTemplateProps) {
  const classes = useStyles();
  return (
    <Chip onClick={() => onClick(template)} label={template} className={classes.chip} />
  );
}

export default React.memo(MessageTemplates);
