import { Activity, ActivityType, DashboardAdminActivities, getDayOfMonthInNumbers, getShortFormattedMonth, MessageJobOverview, Time } from '@runningdinner/shared';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Span, Subtitle } from '../../common/theme/typography/Tags';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import SaveIcon from '@mui/icons-material/Save';
import MailIcon from '@mui/icons-material/Mail';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAdminNavigation } from '../AdminNavigationHook';
import LinkIntern from '../../common/theme/LinkIntern';
import { useTranslation } from 'react-i18next';
import Paragraph from '../../common/theme/typography/Paragraph';
import { HelpIconTooltip } from '../../common/theme/HelpIconTooltip';
import { TextViewHtml } from '../../common/TextViewHtml';
import { styled } from '@mui/material/styles';

export interface AdminActivitiesTimelineProps {
  dashboardAdminActivities: DashboardAdminActivities;
}
export function AdminActivitiesTimeline({ dashboardAdminActivities }: AdminActivitiesTimelineProps) {
  return (
    <Card>
      <CardContent>
        <Subtitle i18n="admin:admin_activities_headline" />
        <ul className="timeline">
          {dashboardAdminActivities.activities.map((activity, index) => (
            <li key={index} className={index % 2 === 1 ? 'timeline-inverted' : ''}>
              <TimelineDot colorCssClass={getActivityStyle(activity.activityType).colorCssClass} date={activity.activityDate} />
              <TimelineContentPanel {...activity} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface TimelineDotProps {
  date: Date;
  colorCssClass: string;
}
function TimelineDot({ date, colorCssClass }: TimelineDotProps) {
  return (
    <div className={`timeline-badge ${colorCssClass}`}>
      <div>{getDayOfMonthInNumbers(date)}</div>
      <div>{getShortFormattedMonth(date)}</div>
    </div>
  );
}
const TimelineHeadlineIconContainer = styled('div')(({ theme }) => ({
  paddingRight: theme.spacing(1),
}));
const TimelineBodyContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

function TimelineContentPanel({ activityDate, activityType, activityHeadline, activityMessage, relatedMessageJobOverview }: Activity) {
  const { generateMessageJobDetailsPath } = useAdminNavigation();
  const { t } = useTranslation('admin');

  function renderHeadlineIcon() {
    const { icon } = getActivityStyle(activityType);
    return icon;
  }

  function isShowMessageJobSendingFinishedInfo(messageJobOverview: MessageJobOverview) {
    return messageJobOverview.sendingFinished && activityType !== ActivityType.MESSAGE_JOB_SENDING_FAILED;
  }

  function isShowMessageJobSendingPendingInfo(messageJobOverview: MessageJobOverview) {
    return !messageJobOverview.sendingFinished && activityType !== ActivityType.MESSAGE_JOB_SENDING_FAILED;
  }

  return (
    <div className="timeline-panel" data-testid="admin-activity-container">
      <div className="timeline-heading">
        <Grid container alignItems="center">
          <Grid item>
            <TimelineHeadlineIconContainer>{renderHeadlineIcon()}</TimelineHeadlineIconContainer>
          </Grid>
          <Grid item>
            <Typography variant="subtitle2">{activityHeadline}</Typography>
          </Grid>
        </Grid>
        <Typography variant={'caption'}>
          <Time date={activityDate} />
        </Typography>
      </div>
      <TimelineBodyContainer>
        <Span>
          <TextViewHtml text={activityMessage} />
        </Span>
        {relatedMessageJobOverview && (
          <div>
            <LinkIntern pathname={generateMessageJobDetailsPath(relatedMessageJobOverview.adminId, relatedMessageJobOverview.messageJobId)} color="primary">
              {relatedMessageJobOverview.numMessagesSucceeded} erfolgreich
            </LinkIntern>
            <br />
            <LinkIntern pathname={generateMessageJobDetailsPath(relatedMessageJobOverview.adminId, relatedMessageJobOverview.messageJobId)} color="secondary">
              {relatedMessageJobOverview.numMessagesFailed} fehlgeschlagen
            </LinkIntern>
            <br />
            {isShowMessageJobSendingFinishedInfo(relatedMessageJobOverview) && (
              <Grid container alignItems="center">
                <Grid item>
                  <TimelineHeadlineIconContainer>
                    <Typography variant={'caption'}>{t('messages_sending_finished')}</Typography>
                  </TimelineHeadlineIconContainer>
                </Grid>
                <Grid item>
                  <HelpIconTooltip sx={{ verticalAlign: 'middle' }} title={<Paragraph i18n="admin:synchronize_messagejobs_help" />} placement="right" fontSize={'small'} />
                </Grid>
              </Grid>
            )}
            {isShowMessageJobSendingPendingInfo(relatedMessageJobOverview) && <Typography variant={'caption'}>{t('messages_sending_pending')}</Typography>}
          </div>
        )}
      </TimelineBodyContainer>
    </div>
  );
}

const ActivityTypeMapping: Record<string, any> = {
  [ActivityType.DINNER_CREATED]: {
    colorCssClass: 'success',
    icon: <SaveIcon fontSize="small" />,
  },
  [ActivityType.DINNER_CANCELLED]: {
    colorCssClass: 'danger',
    icon: <DeleteIcon fontSize="small" />,
  },
  [ActivityType.MEAL_TIMES_UPDATED]: {
    colorCssClass: 'warning',
    icon: <AccessTimeIcon fontSize="small" />,
  },
  [ActivityType.TEAM_ARRANGEMENT_CREATED]: {
    colorCssClass: 'success',
    icon: <GroupIcon fontSize="small" />,
  },
  [ActivityType.TEAMS_RECREATED]: {
    colorCssClass: 'warning',
    icon: <GroupIcon fontSize="small" />,
  },
  [ActivityType.DINNERROUTE_MAIL_SENT]: {
    colorCssClass: 'primary',
    icon: <MailIcon fontSize="small" />,
  },
  [ActivityType.PARTICIPANT_MAIL_SENT]: {
    colorCssClass: 'primary',
    icon: <MailIcon fontSize="small" />,
  },
  [ActivityType.TEAMARRANGEMENT_MAIL_SENT]: {
    colorCssClass: 'primary',
    icon: <MailIcon fontSize="small" />,
  },
  [ActivityType.MESSAGE_JOB_SENDING_FAILED]: {
    colorCssClass: 'danger',
    icon: <MailIcon fontSize="small" />,
  },
};

function getActivityStyle(activityType: ActivityType) {
  const result = ActivityTypeMapping[activityType];
  if (!result) {
    return {
      colorCssClass: 'warning',
      icon: <EditIcon fontSize="small" />,
    };
  }
  return result;
}
