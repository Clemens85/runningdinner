package org.runningdinner.common.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Map;
import java.util.TreeMap;

public class SnsValidator {

	private static final Logger LOGGER = LoggerFactory.getLogger(SnsValidator.class);

	public boolean isMessageValid(SnsMessage message) {
		try {
			String stringToSign = buildStringToSign(message);
			X509Certificate cert = downloadCertificate(message.getSigningCertUrl());
			Signature sig = Signature.getInstance("SHA1withRSA");
			sig.initVerify(cert.getPublicKey());
			sig.update(stringToSign.getBytes(StandardCharsets.UTF_8));
			return sig.verify(Base64.getDecoder().decode(message.getSignature()));
		} catch (Exception e) {
			return false;
		}
	}

	public void confirmSubscription(SnsMessage message) {
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

	private X509Certificate downloadCertificate(String certUrl) throws Exception {
		URL url = new URL(certUrl);
		try (BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()))) {
			CertificateFactory cf = CertificateFactory.getInstance("X.509");
			return (X509Certificate) cf.generateCertificate(url.openStream());
		}
	}

	private String buildStringToSign(SnsMessage msg) {
		Map<String, String> fields = new TreeMap<>();
		if ("Notification".equals(msg.getType())) {
			fields.put("Message", msg.getMessage());
			fields.put("MessageId", msg.getMessageId());
			if (msg.getSubject() != null) {
				fields.put("Subject", msg.getSubject());
			}
			fields.put("Timestamp", msg.getTimestamp());
			fields.put("TopicArn", msg.getTopicArn());
			fields.put("Type", msg.getType());
		} else if ("SubscriptionConfirmation".equals(msg.getType()) || "UnsubscribeConfirmation".equals(msg.getType())) {
			fields.put("Message", msg.getMessage());
			fields.put("MessageId", msg.getMessageId());
			fields.put("SubscribeURL", msg.getSubscribeUrl());
			fields.put("Timestamp", msg.getTimestamp());
			fields.put("Token", "unused"); // Not used in stringToSign per AWS docs
			fields.put("TopicArn", msg.getTopicArn());
			fields.put("Type", msg.getType());
		}

		StringBuilder sb = new StringBuilder();
		for (Map.Entry<String, String> entry : fields.entrySet()) {
			if (entry.getValue() != null) {
				sb.append(entry.getKey()).append("\n").append(entry.getValue()).append("\n");
			}
		}
		return sb.toString();
	}
}