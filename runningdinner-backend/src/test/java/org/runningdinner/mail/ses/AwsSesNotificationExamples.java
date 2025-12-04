package org.runningdinner.mail.ses;

/**
 * Examples from <a href="https://docs.aws.amazon.com/ses/latest/dg/notification-examples.html">...</a>
 */
public final class AwsSesNotificationExamples {

	private AwsSesNotificationExamples() {
		// NOP
	}

	static final String DELIVERY = """
					{
					   "notificationType":"Delivery",
					   "mail":{
					      "timestamp":"2016-01-27T14:59:38.237Z",
					      "messageId":"0000014644fe5ef6-9a483358-9170-4cb4-a269-f5dcdf415321-000000",
					      "source":"john@example.com",
					      "sourceArn": "arn:aws:ses:us-east-1:888888888888:identity/example.com",
					      "sourceIp": "127.0.3.0",
					      "sendingAccountId":"123456789012",
					      "callerIdentity": "IAM_user_or_role_name",
					      "destination":[
					         "jane@example.com"
					      ],\s
					       "headersTruncated":false,
					       "headers":[\s
					        {\s
					           "name":"From",
					           "value":"\\"John Doe\\" <john@example.com>"
					        },
					        {\s
					           "name":"To",
					           "value":"\\"Jane Doe\\" <jane@example.com>"
					        },
					        {\s
					           "name":"Message-ID",
					           "value":"custom-message-ID"
					        },
					        {\s
					           "name":"Subject",
					           "value":"Hello"
					        },
					        {\s
					           "name":"Content-Type",
					           "value":"text/plain; charset=\\"UTF-8\\""
					        },
					        {\s
					           "name":"Content-Transfer-Encoding",
					           "value":"base64"
					        },
					        {\s
					           "name":"Date",
					           "value":"Wed, 27 Jan 2016 14:58:45 +0000"
					        }
					       ],
					       "commonHeaders":{\s
					         "from":[\s
					            "John Doe <john@example.com>"
					         ],
					         "date":"Wed, 27 Jan 2016 14:58:45 +0000",
					         "to":[\s
					            "Jane Doe <jane@example.com>"
					         ],
					         "messageId":"custom-message-ID",
					         "subject":"Hello"
					       }
					    },
					   "delivery":{
					      "timestamp":"2016-01-27T14:59:38.237Z",
					      "recipients":["jane@example.com"],
					      "processingTimeMillis":546,    \s
					      "reportingMTA":"a8-70.smtp-out.amazonses.com",
					      "smtpResponse":"250 ok:  Message 64111812 accepted",
					      "remoteMtaIp":"127.0.2.0"
					   }\s
					}
					""";

	static final String BOUNCE = """
					  {
					      "notificationType":"Bounce",
					      "bounce":{
					         "bounceType":"Permanent",
					         "reportingMTA":"dns; email.example.com",
					         "bouncedRecipients":[
					            {
					               "emailAddress":"jane@example.com",
					               "status":"5.1.1",
					               "action":"failed",
					               "diagnosticCode":"smtp; 550 5.1.1 <jane@example.com>... User"
					            }
					         ],
					         "bounceSubType":"General",
					         "timestamp":"2016-01-27T14:59:38.237Z",
					         "feedbackId":"00000138111222aa-33322211-cccc-cccc-cccc-ddddaaaa068a-000000",
					         "remoteMtaIp":"127.0.2.0"
					      },
					      "mail":{
					         "timestamp":"2016-01-27T14:59:38.237Z",
					         "source":"john@example.com",
					         "sourceArn": "arn:aws:ses:us-east-1:888888888888:identity/example.com",
					         "sourceIp": "127.0.3.0",
					         "sendingAccountId":"123456789012",
					         "callerIdentity": "IAM_user_or_role_name",
					         "messageId":"00000138111222aa-33322211-cccc-cccc-cccc-ddddaaaa0680-000000",
					         "destination":[
					           "jane@example.com"],
					         "headersTruncated":false,
					         "headers":[\s
					          {\s
					            "name":"From",
					            "value":"\\"John Doe\\" <john@example.com>"
					          },
					          {\s
					            "name":"To",
					            "value":"\\"Jane Doe\\" <jane@example.com>"
					          },
					          {\s
					            "name":"Message-ID",
					            "value":"custom-message-ID"
					          },
					          {\s
					            "name":"Subject",
					            "value":"Hello"
					          },
					          {\s
					            "name":"Content-Type",
					            "value":"text/plain; charset=\\"UTF-8\\""
					          },
					          {\s
					            "name":"Content-Transfer-Encoding",
					            "value":"base64"
					          },
					          {\s
					            "name":"Date",
					            "value":"Wed, 27 Jan 2016 14:05:45 +0000"
					          }
					         ],
					         "commonHeaders":{\s
					            "from":[\s
					               "John Doe <john@example.com>"
					            ],
					            "date":"Wed, 27 Jan 2016 14:05:45 +0000",
					            "to":[\s
					               "Jane Doe <jane@example.com>"
					            ],
					            "messageId":"custom-message-ID",
					            "subject":"Hello"
					          }
					       }
					   }
		""";

	static final String COMPLAINT = """
					 {
					    "notificationType":"Complaint",
					    "complaint":{
					       "userAgent":"AnyCompany Feedback Loop (V0.01)",
					       "complainedRecipients":[
					          {
					             "emailAddress":"jane@example.com"
					          }
					       ],
					       "complaintFeedbackType":"abuse",
					       "arrivalDate":"2016-01-27T14:59:38.237Z",
					       "timestamp":"2016-01-27T14:59:38.237Z",
					       "feedbackId":"000001378603177f-18c07c78-fa81-4a58-9dd1-fedc3cb8f49a-000000"
					    },
					    "mail":{
					       "timestamp":"2016-01-27T14:59:38.237Z",
					       "messageId":"000001378603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000",
					       "source":"john@example.com",
					       "sourceArn": "arn:aws:ses:us-east-1:888888888888:identity/example.com",
					       "sourceIp": "127.0.3.0",
					       "sendingAccountId":"123456789012",
					       "callerIdentity": "IAM_user_or_role_name",
					       "destination":[
					          "jane@example.com"
					       ],\s
					        "headersTruncated":false,
					        "headers":[\s
					         {\s
					           "name":"From",
					           "value":"\\"John Doe\\" <john@example.com>"
					         },
					         {\s
					           "name":"To",
					           "value":"\\"Jane Doe\\" <jane@example.com>"
					         },
					         {\s
					           "name":"Message-ID",
					           "value":"custom-message-ID"
					         },
					         {\s
					           "name":"Subject",
					           "value":"Hello"
					         },
					         {\s
					           "name":"Content-Type",
					           "value":"text/plain; charset=\\"UTF-8\\""
					         },
					         {\s
					           "name":"Content-Transfer-Encoding",
					           "value":"base64"
					         },
					         {\s
					           "name":"Date",
					           "value":"Wed, 27 Jan 2016 14:05:45 +0000"
					         }
					       ],
					       "commonHeaders":{\s
					         "from":[\s
					            "John Doe <john@example.com>"
					         ],
					         "date":"Wed, 27 Jan 2016 14:05:45 +0000",
					         "to":[\s
					            "Jane Doe <jane@example.com>"
					         ],
					         "messageId":"custom-message-ID",
					         "subject":"Hello"
					       }
					    }
					 }
		""";

	static final String DELIVERY_WITH_EVENT_TYPE = """
					{
					  "eventType": "Delivery",
					  "mail": {
					    "timestamp": "2025-12-04T06:57:27.644Z",
					    "source": "runyourdinner@mailing.runyourdinner.eu",
					    "sourceArn": "xxx",
					    "sendingAccountId": "xxx",
					    "messageId": "xxx",
					    "destination": [
					      "jane@example.com"
					    ],
					    "headersTruncated": false,
					    "headers": [
					      {
					        "name": "From",
					        "value": "runyourdinner@mailing.runyourdinner.eu"
					      },
					      {
					        "name": "Reply-To",
					        "value": "jane@example.com"
					      },
					      {
					        "name": "To",
					        "value": "jane@example.com"
					      },
					      {
					        "name": "Subject",
					        "value": "XXX"
					      },
					      {
					        "name": "MIME-Version",
					        "value": "1.0"
					      },
					      {
					        "name": "Content-Type",
					        "value": "text/html; charset=UTF-8"
					      },
					      {
					        "name": "Content-Transfer-Encoding",
					        "value": "quoted-printable"
					      }
					    ],
					    "commonHeaders": {
					      "from": [
					        "runyourdinner@mailing.runyourdinner.eu"
					      ],
					      "replyTo": [
					        "jane@example.com"
					      ],
					      "to": [
					        "jane@example.com"
					      ],
					      "messageId": "XXX",
					      "subject": "XXX"
					    },
					    "tags": {
					      "ses:source-tls-version": [
					        "TLSv1.3"
					      ],
					      "ses:operation": [
					        "SendEmail"
					      ],
					      "ses:configuration-set": [
					        "runyourdinner"
					      ],
					      "ses:outgoing-tls-version": [
					        "TLSv1.3"
					      ],
					      "ses:source-ip": [
					        "XXX"
					      ],
					      "ses:from-domain": [
					        "mailing.runyourdinner.eu"
					      ],
					      "ses:caller-identity": [
					        "XXX"
					      ],
					      "ses:outgoing-ip": [
					        "XXX"
					      ]
					    }
					  },
					  "delivery": {
					    "timestamp": "2025-12-04T06:57:28.120Z",
					    "processingTimeMillis": 476,
					    "recipients": [
					      "jane@example.com"
					    ],
					    "smtpResponse": "250 Requested mail action okay, completed: id=1MA5nW-1vKykP3tMI-003AoD",
					    "remoteMtaIp": "XXX",
					    "reportingMTA": "XXX"
					  }
					}
					""";
}
