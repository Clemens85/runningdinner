import Chip from "@material-ui/core/Chip";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import HelpIconTooltip from "common/theme/HelpIconTooltip";
import Paragraph from "common/theme/typography/Paragraph";

const useStyles = makeStyles((theme) => ({
  chip: {
      margin: theme.spacing(0.5),
  }
}));

function MessageTemplates({templates, onTemplateClick}) {
  const messageTemplateNodes = templates.map(template => <MessageTemplate key={template} template={template} onClick={onTemplateClick} />);
  return (
      <Grid container alignItems={"center"} justify={"flex-start"}>
        <Grid item><Box component={"span"} pr={1}>Benutze folgende Templates: </Box></Grid>
        <Grid item>{messageTemplateNodes}</Grid>
        <Grid item>
          <HelpIconTooltip content={<Paragraph i18n='admin:mails_template_help_description'/>} placement='right' />
        </Grid>
      </Grid>
  );
}

function MessageTemplate({template, onClick}) {
  const classes = useStyles();
  return (
    <Chip onClick={() => onClick(template)} label={template} className={classes.chip}></Chip>
  );
}

export default React.memo(MessageTemplates);
