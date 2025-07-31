package org.runningdinner.common.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.HttpsURLConnection;
import java.net.URL;

public final class SnsUtil {

	private static final Logger LOGGER = LoggerFactory.getLogger(SnsUtil.class);

	private SnsUtil() {
		// Utility class, no instantiation
	}

	public static void confirmSubscription(SnsMessage message) {
		try {
			URL url = new URL(message.getSubscribeUrl());
			HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			int code = conn.getResponseCode();
			if (code == 200) {
				LOGGER.info("Subscription confirmed successfully.");
			} else {
				LOGGER.error("Failed to confirm subscription: HTTP {}", code);
			}
		} catch (Exception e) {
			LOGGER.error("Error confirming subscription", e);
		}
	}

	public static boolean isNotificationWithPayload(SnsMessage message) {
		return message != null && message.getType() != null && message.getType().equals("Notification");
	}
}