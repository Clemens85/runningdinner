package org.runningdinner.mail.ses;
import org.runningdinner.common.exception.TechnicalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;


public class AwsSesWrapper implements MailSender {

  private static final Logger LOGGER = LoggerFactory.getLogger(AwsSesWrapper.class);

  private final boolean htmlEmail;

  private SesClient client;

  public AwsSesWrapper(String accessKeyId, String accessKeySecret, boolean htmlEmail) {
    this.htmlEmail = htmlEmail;
    initSESClient(accessKeyId, accessKeySecret);
  }

  private void initSESClient(String accessKeyId, String accessKeySecret) {
    this.client = SesClient.builder()
      .region(Region.EU_CENTRAL_1)
      .credentialsProvider(new AwsCredentialsProvider() {
        @Override
        public AwsCredentials resolveCredentials() {
          return new AwsCredentials() {
            @Override
            public String accessKeyId() {
              return accessKeyId;
            }

            @Override
            public String secretAccessKey() {
              return accessKeySecret;
            }
          };
        }
      })
      .build();
  }

  @Override
  public void send(SimpleMailMessage simpleMessage) throws MailException {

    Destination destination = Destination.builder()
      .toAddresses(simpleMessage.getTo())
      .build();

    Content sub = Content.builder()
      .data(simpleMessage.getSubject())
      .build();

    Content content = Content.builder()
      .data(simpleMessage.getText())
      .build();

    Body body;
    if (htmlEmail) {
      body = Body.builder()
        .html(content)
        .build();
    } else {
      body = Body.builder()
        .text(content)
        .build();
    }

    Message msg = Message.builder()
      .subject(sub)
      .body(body)
      .build();

    SendEmailRequest emailRequest = SendEmailRequest.builder()
      .destination(destination)
      .message(msg)
      .source(simpleMessage.getFrom())
      .replyToAddresses(simpleMessage.getReplyTo())
      .build();

    try {
      LOGGER.info("Trying to send email message from {} to {}...", simpleMessage.getFrom(), destination.toAddresses());
      SendEmailResponse response = client.sendEmail(emailRequest);
      LOGGER.info("Sending of email message from {} to {} returned following response {}", simpleMessage.getFrom(), destination.toAddresses(), response.toString());
    } catch (SesException e) {
      LOGGER.error("Error when trying to send email request", e);
      throw new TechnicalException(e);
    }
  }

  @Override
  public void send(SimpleMailMessage... simpleMessages) {
    for (SimpleMailMessage simpleMessage : simpleMessages) {
      send(simpleMessage);
    }
  }

}
