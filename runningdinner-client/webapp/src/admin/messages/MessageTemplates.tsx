import React from "react";
import {Box, Grid, Chip, useMediaQuery} from "@mui/material";
import {HelpIconTooltip} from "../../common/theme/HelpIconTooltip";
import Paragraph from "../../common/theme/typography/Paragraph";
import {useTranslation} from "react-i18next";
import {isArrayEmpty} from "@runningdinner/shared";
import {styled, Theme} from "@mui/material/styles";


const MessageTemplateChip = styled(Chip)(({theme}) => ({
  margin: theme.spacing(0.5)
}));

export interface MessageTemplatesProps {
  onTemplateClick: (template: string) => unknown;
  templates?: string[];
  showTemplatesHelpIcon: boolean;
}

function MessageTemplates({templates, onTemplateClick, showTemplatesHelpIcon}: MessageTemplatesProps) {

  const {t} = useTranslation('admin');

  const smUpDevice = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

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
    <Grid container alignItems={"center"} justifyContent={"flex-start"} sx={{ mb: 2 }}>
      { smUpDevice &&
        <Grid item>
          <Box component={"span"} pr={1}>{t('mails_template_help')}: </Box>
        </Grid> }
      {messageTemplateNodes}
      {showTemplatesHelpIcon &&
        <Grid item>
          <HelpIconTooltip title={<Paragraph i18n='admin:mails_template_help_description'/>} 
                           sx={{ verticalAlign: "middle" }}
                           placement='right'/>
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
  return (
    <MessageTemplateChip onClick={() => onClick(template)} label={template} />
  );
}

export default React.memo(MessageTemplates);
