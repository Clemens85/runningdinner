import { Box, Chip, Divider, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText,useMediaQuery } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { isArrayEmpty, useDisclosure } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import { HelpIconTooltip } from '../../common/theme/HelpIconTooltip';
import LinkAction from '../../common/theme/LinkAction';
import Paragraph from '../../common/theme/typography/Paragraph';

const MessageTemplateChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export interface MessageTemplatesProps {
  onTemplateClick: (template: string) => unknown;
  templates?: string[];
  showTemplatesHelpIcon: boolean;
}

function MessageTemplates({ templates, onTemplateClick, showTemplatesHelpIcon }: MessageTemplatesProps) {
  const { t } = useTranslation(['admin', 'common']);

  const smUpDevice = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const { isOpen, open, close } = useDisclosure();

  if (isArrayEmpty(templates)) {
    return null;
  }

  // @ts-ignore
  const messageTemplateNodes = templates.map((template) => (
    <Grid key={template}>
      <MessageTemplate template={template} onClick={onTemplateClick} />
    </Grid>
  ));
  return (
    <>
      <Grid container alignItems={'center'} justifyContent={'flex-start'} sx={{ mb: 2 }}>
        {smUpDevice && (
          <Grid>
            <Box component={'span'} pr={1}>
              {t('admin:mails_template_help')}:{' '}
            </Box>
          </Grid>
        )}
        {messageTemplateNodes}
        {showTemplatesHelpIcon && (
          <Grid>
            <HelpIconTooltip
              title={
                <>
                  <Paragraph i18n="admin:mails_template_help_description" />
                  <Box sx={{ mt: 1 }}>
                    <LinkAction onClick={() => open()}>
                      <Paragraph i18n="common:more"></Paragraph>
                    </LinkAction>
                  </Box>
                </>
              }
              sx={{ verticalAlign: 'middle' }}
              placement="right"
            />
          </Grid>
        )}
      </Grid>
      {isOpen && (
        <ConfirmationDialog buttonConfirmText={t('common:ok')} onClose={close} dialogTitle={t('common:help')} dialogContent={<TemplateHelpLegend templates={templates} />} />
      )}
    </>
  );
}

function TemplateHelpLegend({ templates }: Pick<MessageTemplatesProps, 'templates'>) {
  const { t } = useTranslation(['admin']);

  function getTemplateHelp(template: string): string {
    if (template.length < 2) {
      return '';
    }
    const templateWithoutBraces = template.substring(1, template.length - 1);
    return t(`message_template_help_${templateWithoutBraces}`);
  }

  return (
    <Box>
      <Paragraph i18n="admin:message_template_help_description" />
      <Divider sx={{ my: 2 }}>
        <strong>{t('admin:legend')}</strong>
      </Divider>
      <List dense>
        {(templates || []).map((template) => (
          <ListItem disablePadding key={template}>
            <ListItemButton>
              <ListItemIcon>
                <MessageTemplateChip label={template} />
              </ListItemIcon>
              <ListItemText primary={<>{getTemplateHelp(template)}</>} sx={{ textAlign: 'right' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

interface MessageTemplateProps {
  template: string;
  onClick: (template: string) => unknown;
}
function MessageTemplate({ template, onClick }: MessageTemplateProps) {
  return <MessageTemplateChip onClick={() => onClick(template)} label={template} />;
}

export default React.memo(MessageTemplates);
