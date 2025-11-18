package org.runningdinner.mail.mailjet;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.MailjetResponse;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.resource.Contact;
import org.json.JSONArray;
import org.json.JSONObject;
import org.runningdinner.MailConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
public class MailJetContactDeletionService {

	private static final Logger LOGGER = LoggerFactory.getLogger(MailJetContactDeletionService.class);

	private static final int MAX_CONTACTS_TO_DELETE_BATCH = 50;
	private static final int NUM_DELETE_BATCHES = 3;

	private final MailConfig mailConfig;
	private final HttpClient httpClient;

	public MailJetContactDeletionService(MailConfig mailConfig) {
		this.mailConfig = mailConfig;
		this.httpClient = HttpClient.newBuilder()
						.connectTimeout(Duration.ofSeconds(30))
						.build();
	}

	public void performContactDeletion() {

		if (!mailConfig.isMailJetApiEnabled()) {
			LOGGER.info("MailJet API is disabled, skipping contact deletion");
			return;
		}

		String apiKeyPublic = mailConfig.getMailJetApiKeyPublicMandatory();
		String apiKeyPrivate = mailConfig.getMailJetApiKeyPrivateMandatory();

		MailjetClient client = new MailjetClient(
						ClientOptions.builder()
										.apiKey(apiKeyPublic)
										.apiSecretKey(apiKeyPrivate)
										.build()
		);

		// Create Basic Auth header for deletion
		String auth = apiKeyPublic + ":" + apiKeyPrivate;
		String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
		String authHeader = "Basic " + encodedAuth;

		int totalDeletedCount = 0;
		int totalFailedCount = 0;

		LOGGER.info("Starting batch deletion of MailJet contacts: {} batches of {} contacts each",
						NUM_DELETE_BATCHES, MAX_CONTACTS_TO_DELETE_BATCH);

		// Process in batches
		for (int batchNum = 1; batchNum <= NUM_DELETE_BATCHES; batchNum++) {
			LOGGER.info("Processing batch {}/{}", batchNum, NUM_DELETE_BATCHES);

			// Fetch contacts for this batch
			JSONArray contacts = fetchContactsToDelete(client);

			if (contacts == null || contacts.isEmpty()) {
				LOGGER.info("No more contacts found in MailJet to delete, stopping after batch {}", batchNum);
				break;
			}

			LOGGER.info("Fetched {} contacts for batch {}", contacts.length(), batchNum);

			// Delete the fetched contacts
			DeletionResult result = deleteContacts(contacts, authHeader);

			totalDeletedCount += result.deletedCount;
			totalFailedCount += result.failedCount;

			LOGGER.info("Batch {} completed: {} deleted, {} failed", batchNum, result.deletedCount, result.failedCount);
		}

		LOGGER.info("Completed MailJet contact deletion job: {} total contacts deleted, {} failed across {} batches",
						totalDeletedCount, totalFailedCount, NUM_DELETE_BATCHES);
	}

	private JSONArray fetchContactsToDelete(MailjetClient client) {
		try {
			// See https://github.com/mailjet/mailjet-apiv3-java?tab=readme-ov-file#request-examples
			MailjetRequest request = new MailjetRequest(Contact.resource)
							.filter(Contact.LIMIT, MAX_CONTACTS_TO_DELETE_BATCH)
							.filter("Sort", "CreatedAt ASC");

			MailjetResponse response = client.get(request);

			if (response.getStatus() != 200) {
				LOGGER.error("Failed to retrieve contacts from MailJet. Status: {}, Response: {}",
								response.getStatus(), response.getRawResponseContent());
				return null;
			}

			return response.getData();

		} catch (MailjetException e) {
			LOGGER.error("Failed to retrieve contacts from MailJet due to communication error: {}", e.getMessage(), e);
			return null;
		}
	}

	private DeletionResult deleteContacts(JSONArray contacts, String authHeader) {
		int deletedCount = 0;
		int failedCount = 0;

		for (int i = 0; i < contacts.length(); i++) {
			try {
				JSONObject contact = contacts.getJSONObject(i);
				long contactId = contact.getLong("ID");
				String email = contact.optString("Email", "unknown");

				boolean deleted = deleteContactViaV4Api(contactId, authHeader);

				if (deleted) {
					deletedCount++;
					LOGGER.debug("Successfully deleted MailJet contact {} ({})", contactId, email);
				} else {
					failedCount++;
					LOGGER.warn("Failed to delete MailJet contact {} ({})", contactId, email);
				}
			} catch (Exception e) {
				failedCount++;
				LOGGER.warn("Error deleting MailJet contact: {}", e.getMessage());
			}
		}

		return new DeletionResult(deletedCount, failedCount);
	}

	private record DeletionResult(int deletedCount, int failedCount) {
	}

	private boolean deleteContactViaV4Api(long contactId, String authHeader) throws IOException, InterruptedException {
		// MailJet v4 API endpoint for contact deletion
		String url = "https://api.mailjet.com/v4/contacts/" + contactId;

		HttpRequest request = HttpRequest.newBuilder()
						.uri(URI.create(url))
						.header("Authorization", authHeader)
						.timeout(Duration.ofSeconds(30))
						.DELETE()
						.build();

		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

		int statusCode = response.statusCode();

		if (statusCode != 200 && statusCode != 204) {
			LOGGER.debug("Delete request failed with status {}: {}", statusCode, response.body());
		}

		return statusCode == 200 || statusCode == 204;
	}

}
