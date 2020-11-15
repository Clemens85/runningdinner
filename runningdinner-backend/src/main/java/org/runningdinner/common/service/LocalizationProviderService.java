package org.runningdinner.common.service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.core.util.DateTimeUtil;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

@Service
public class LocalizationProviderService {

	public Locale getUserLocale() {
		Locale locale = LocaleContextHolder.getLocale();
		if (locale == null) {
			locale = getDefaultLocale();
		}
		return locale;
	}

	private static Locale getDefaultLocale() {
		return CoreUtil.getDefaultLocale();
	}

	public Locale getLocaleOfDinner(RunningDinner runningDinner) {
	 
	  String languageCode = runningDinner.getLanguageCode();
	  return getLocaleFromLanguageCode(languageCode);
	}
	
	public DateTimeFormatter getTimeFormatter() {
	  
	  return DateTimeUtil.getTimeFormatter(getUserLocale().getLanguage());
	}
	
	 public DateTimeFormatter getTimeFormatterOfDinner(RunningDinner runningDinner) {
	   
	   Locale localeOfDinner = getLocaleOfDinner(runningDinner);
	   return DateTimeUtil.getTimeFormatter(localeOfDinner.getLanguage());
  }

	private static Locale getLocaleFromLanguageCode(String languageCode) {

	  if (StringUtils.equalsIgnoreCase("en", languageCode) || StringUtils.equalsIgnoreCase("de", languageCode)) {
	    return new Locale(StringUtils.lowerCase(languageCode));
	  }
	  return getDefaultLocale();
	}
	
}
