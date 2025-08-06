package org.runningdinner.common.aws;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.test.util.ApplicationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class SnsMessageMapperServiceTest {

	@Autowired
	private SnsMessageMapperService snsMessageMapperService;

	@Test
	public void mapToMessageWithAutoConfirm() {
		String messageBody = """
			{
				"Type": "Notification",
				"MessageId": "12345",
				"TopicArn": "arn:aws:sns:us-east-1:123456789012:MyTopic",
				"SubscribeURL": "https://sns.us-east-1.amazonaws.com/subscribe?topic=MyTopic",
				"Message": "This is a test message"
			}
		""";
		SnsMessage snsMessage = snsMessageMapperService.mapToMessageWithAutoConfirm(messageBody);

		assertThat(snsMessage.getMessageId()).isEqualTo("12345");
		assertThat(SnsUtil.isNotificationWithPayload(snsMessage)).isTrue();
		assertThat(snsMessage.getMessage()).isEqualTo("This is a test message");
	}

}


