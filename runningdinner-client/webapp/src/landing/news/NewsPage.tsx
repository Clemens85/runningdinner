import { Box, Grid } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

import { PageTitle } from '../../common/theme/typography/Tags';
import { NewsCard } from './NewsCard';
import { useNewsItems } from './NewsItemsHook';

export function NewsPage() {
  const { t } = useTranslation(['news', 'common']);

  const newsItems = useNewsItems();

  return (
    <Box sx={{ mb: 3 }}>
      <PageTitle mt={4}>{t('common:news')}</PageTitle>
      <Grid container direction={'column'} spacing={3}>
        {newsItems.map((newsItem) => (
          <Grid
            key={newsItem.title}
            size={{
              xs: 12,
              lg: 10,
              xl: 8
            }}>
            <NewsCard title={t(`news:${newsItem.title}`)} content={<Trans i18nKey={`news:${newsItem.content}`} />} date={newsItem.date} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
