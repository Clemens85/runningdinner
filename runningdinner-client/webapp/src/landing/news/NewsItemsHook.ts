import { parse } from 'date-fns';
import { orderBy, startsWith } from 'lodash-es';
import { useMemo } from 'react';
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

  // Register bundles synchronously during render (idempotent — safe to call every render).
  // Must happen before fetchNewsItems() is called via useMemo; a useEffect would run too late.
  i18n.addResourceBundle('de', 'news', News_de);
  i18n.addResourceBundle('en', 'news', News_en);

  function fetchNewsItems(): NewsItem[] {
    const resourceBundle = i18n.getResourceBundle(i18n.language, 'news');
    if (!resourceBundle) return [];

    let result = new Array<NewsItem>();
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

  // Recompute when language changes; no state needed
  const newsItems = useMemo(() => fetchNewsItems(), [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  return newsItems;
}
