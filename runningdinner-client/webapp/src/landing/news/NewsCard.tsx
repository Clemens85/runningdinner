import {LocalDate} from "@runningdinner/shared";
import CardContent from "@mui/material/CardContent";
import { Avatar, CardHeader } from "@mui/material";
import {NewsItem} from "./NewsItemsHook";
import {CardFlexibleHeight} from "../LandingStyles";
import AssignmentIcon from '@mui/icons-material/Assignment';

interface NewsCardItem extends Omit<NewsItem, "content"> {
  content: React.ReactNode;
}

export function NewsCard({title, content, date}: NewsCardItem) {

  return (
    <CardFlexibleHeight>
      <CardHeader title={title}
                  sx={{ pb: 0 }}
                  avatar={<Avatar sx={{ color: '#fff', backgroundColor: 'primary.main' }}><AssignmentIcon /></Avatar>}
                  subheader={<LocalDate date={date} />} />
      <CardContent>
        <div>{content}</div>
      </CardContent>
    </CardFlexibleHeight>
  );
}