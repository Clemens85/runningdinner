package org.runningdinner.mail;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.util.DateTimeUtil;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;

public class MailUtil {

	private MailUtil() {
		// Utility class, no instantiation allowed
	}

	public static LocalDateTime parseIsoTimestampToLocalDateTime(String isoString) {
		try {
			ZoneId localTimeZone = DateTimeUtil.getTimeZoneForEuropeBerlin();
			Instant instant = Instant.parse(isoString);
			return LocalDateTime.ofInstant(instant, localTimeZone);
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException("Invalid ISO 8601 timestamp: " + isoString, e);
		}
	}

	public static String normalizeEmailAddress(String email) {
		return StringUtils.trim(StringUtils.lowerCase(email));
	}

	public static long parseIsoTimestampToUnixTimestamp(String isoTimestamp) {
		try {
			// Parse directly as Instant if it's properly formatted
			Instant instant = Instant.parse(isoTimestamp);
			return instant.getEpochSecond();
		} catch (DateTimeParseException e1) {
			// Fallback: parse using a formatter if needed
			try {
				ZonedDateTime zdt = ZonedDateTime.parse(isoTimestamp, DateTimeFormatter.ISO_DATE_TIME);
				return zdt.toEpochSecond();
			} catch (Exception e2) {
				return new Date().toInstant().getEpochSecond();
			}
		}
	}

}
