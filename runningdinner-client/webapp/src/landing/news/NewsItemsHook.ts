import { parse } from 'date-fns';
import { orderBy, startsWith } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import News_de from './NewsMessages_lang_de';
import News_en from './NewsMessages_lang_en';

export interface NewsItem {
  title: string;
  content: string;
  date: Date;
}

export function useNewsItems() {
  const { i18n } = useTranslation();

  const [newsItems, setNewsItems] = useState<Array<NewsItem>>([]);

  useEffect(() => {
    i18n.addResourceBundle('de', 'news', News_de);
    i18n.addResourceBundle('en', 'news', News_en);
  }, [i18n]);

  useEffect(() => {
    const fetchedNewsItems = fetchNewsItems();
    setNewsItems(fetchedNewsItems);
    // eslint-disable-next-line
  }, [i18n.language]);

  function fetchNewsItems(): NewsItem[] {
    let result = new Array<NewsItem>();

    const resourceBundle = i18n.getResourceBundle(i18n.language, 'news');

    Object.keys(resourceBundle).forEach(function (translationKey) {
      if (startsWith(translationKey, 'news_title_')) {
        const newsDateStr = translationKey.substring(11);
        result.push({
          title: translationKey,
          content: 'news_content_' + newsDateStr,
          date: parse(newsDateStr, 'yyyyMMdd', new Date()),
        });
      }
    });
    result = orderBy(result, 'date', ['desc']);
    return result;
  }

  return newsItems;
}
