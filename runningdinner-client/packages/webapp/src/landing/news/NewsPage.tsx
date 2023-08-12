import React from 'react';
import {PageTitle} from "../../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {useNewsItems} from "./NewsItemsHook";
import {NewsCard} from "./NewsCard";
import {Box, Grid} from '@mui/material';

export function NewsPage() {

  const {t} = useTranslation(["news", "common"]);

  const newsItems = useNewsItems();

  return (
    <Box sx={{ mb: 3 }}>
      <PageTitle mt={4}>{t('common:news')}</PageTitle>
      <Grid container direction={"column"} spacing={3}>
        {
          newsItems.map(newsItem =>
            <Grid item xs={12} lg={10} xl={8} key={newsItem.title}>
              <NewsCard title={t(`news:${newsItem.title}`)}
                        content={t(`news:${newsItem.content}`)}
                        date={newsItem.date} />
            </Grid>
          )
        }
      </Grid>
    </Box>
  );
}