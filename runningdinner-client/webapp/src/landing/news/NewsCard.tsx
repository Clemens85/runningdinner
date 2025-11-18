import AssignmentIcon from '@mui/icons-material/Assignment';
import { Avatar, CardHeader } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { LocalDate } from '@runningdinner/shared';

import { CardFlexibleHeight } from '../LandingStyles';
import { NewsItem } from './NewsItemsHook';

interface NewsCardItem extends Omit<NewsItem, 'content'> {
  content: React.ReactNode;
}

export function NewsCard({ title, content, date }: NewsCardItem) {
  return (
    <CardFlexibleHeight>
      <CardHeader
        title={title}
        sx={{ pb: 0 }}
        avatar={
          <Avatar sx={{ color: '#fff', backgroundColor: 'primary.main' }}>
            <AssignmentIcon />
          </Avatar>
        }
        subheader={<LocalDate date={date} />}
      />
      <CardContent>
        <div>{content}</div>
      </CardContent>
    </CardFlexibleHeight>
  );
}
