package org.runningdinner.mail.mailjet;

public final class MailJetExamples {

	private MailJetExamples() {
		// Prevent instantiation
	}

	public static final String DELIVERY = """
					[{
					  "event": "sent",
					  "time": 1433333949,
					  "MessageID": 19421777835146490,
					  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
					  "email": "jane@example.com",
					  "mj_campaign_id": 7257,
					  "mj_contact_id": 4,
					  "customcampaign": "",
					  "mj_message_id": "19421777835146490",
					  "smtp_reply": "sent (250 2.0.0 OK 1433333948 fa5si855896wjc.199 - gsmtp)",
					  "CustomID": "helloworld",
					  "Payload": ""
					}]
					""";

	public static final String BOUNCE = """
					[{
					   "event": "bounce",
					   "time": 1433333949,
					   "MessageID": 13792286917004336,
					   "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
					   "email": "jane@example.com",
					   "mj_campaign_id": 0,
					   "mj_contact_id": 0,
					   "customcampaign": "",
					   "CustomID": "helloworld",
					   "Payload": "",
					   "blocked": false,
					   "hard_bounce": true,
					   "error_related_to": "recipient",
					   "error": "user unknown",
					   "comment": "Host or domain name not found. Name service error for name=lbjsnrftlsiuvbsren.com type=A: Host not found"
					}]
					""";

	public static final String SPAM = """
					[{
					  "event": "spam",
					  "time": 1433333949,
					  "MessageID": 13792286917004336,
					  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
					  "email": "jane@example.com",
					  "mj_campaign_id": 0,
					  "mj_contact_id": 0,
					  "customcampaign": "",
					  "CustomID": "helloworld",
					  "Payload": "",
					  "source": "JMRPP"
					}]
		""";
}
