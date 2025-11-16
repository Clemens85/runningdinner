import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Subtitle } from '../../common/theme/typography/Tags';
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material';
import { BaseRunningDinnerProps, DashboardAdminActivities, getDaysFromTodayTillEndOfRegistration, isClosedDinner } from '@runningdinner/shared';
import DoneIcon from '@mui/icons-material/Done';
import SaveIcon from '@mui/icons-material/Save';
import MailIcon from '@mui/icons-material/Mail';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from 'react-i18next';

export interface ChecklistProps extends BaseRunningDinnerProps {
  dashboardAdminActivities: DashboardAdminActivities;
}

export default function Checklist(props: ChecklistProps) {
  const { t } = useTranslation('admin');

  const { runningDinner, dashboardAdminActivities } = props;

  const { dinnerCreated, dinnerRouteMessagesSent, endOfRegistrationDate, participantMessagesSent, teamArrangementsCreated, teamMessagesSent } = dashboardAdminActivities.checkList;
  const checklistItems = [];
  checklistItems.push(
    <ChecklistItem label={t('checklist_create_dinner')} checked={dinnerCreated} icon={<SaveIcon color={getColor(dinnerCreated)} />} key="checklist_create_dinner" />,
  );
  if (!isClosedDinner(runningDinner)) {
    let secondaryLabel = undefined;
    if (!endOfRegistrationDate) {
      const daysFromTodayTillEndOfRegistration = getDaysFromTodayTillEndOfRegistration(runningDinner);
      secondaryLabel = t('checklist_end_of_registrationdate_days_left', { days: daysFromTodayTillEndOfRegistration });
    }
    checklistItems.push(
      <ChecklistItem
        label={t('checklist_end_of_registrationdate')}
        secondaryLabel={secondaryLabel}
        checked={endOfRegistrationDate}
        icon={<CalendarTodayIcon color={getColor(endOfRegistrationDate)} />}
        key="endOfRegistrationDate"
      />,
    );
  }
  checklistItems.push(
    <ChecklistItem
      label={t('checklist_send_participant_messages')}
      checked={participantMessagesSent}
      icon={<MailIcon color={getColor(participantMessagesSent)} />}
      key="checklist_send_participant_messages"
    />,
  );

  checklistItems.push(
    <ChecklistItem
      label={t('checklist_create_teamarrangements')}
      checked={teamArrangementsCreated}
      icon={<GroupIcon color={getColor(teamArrangementsCreated)} />}
      key="checklist_create_teamarrangements"
    />,
  );
  checklistItems.push(
    <ChecklistItem
      label={t('checklist_send_team_messages')}
      checked={teamMessagesSent}
      icon={<MailIcon color={getColor(teamMessagesSent)} />}
      key="checklist_send_team_messages"
    />,
  );
  checklistItems.push(
    <ChecklistItem
      label={t('checklist_send_dinnerroute_messages')}
      checked={dinnerRouteMessagesSent}
      icon={<MailIcon color={getColor(dinnerRouteMessagesSent)} />}
      key="checklist_send_dinnerroute_messages"
    />,
  );

  return (
    <Card>
      <CardContent>
        <Subtitle i18n="admin:checklist" />
        <Box>
          <List>{checklistItems}</List>
        </Box>
      </CardContent>
    </Card>
  );
}

interface ChecklistItemProps {
  icon: React.ReactNode;
  label: string;
  checked?: boolean;
  secondaryLabel?: string;
}

function ChecklistItem({ icon, label, checked, secondaryLabel }: ChecklistItemProps) {
  return (
    <ListItem divider={true} color={getColor(checked)}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant={'subtitle2'} color={getColor(checked)}>
            {label}
          </Typography>
        }
        secondary={secondaryLabel}
      />
      {checked && (
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="checked" color={'primary'} size="large">
            <DoneIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

function getColor(checked?: boolean) {
  return checked ? 'primary' : undefined;
}
