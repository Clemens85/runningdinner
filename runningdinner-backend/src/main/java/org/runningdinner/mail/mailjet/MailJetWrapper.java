package org.runningdinner.mail.mailjet;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.MailjetResponse;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.resource.Emailv31;
import org.json.JSONArray;
import org.json.JSONObject;
import org.runningdinner.common.exception.TechnicalException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;

public class MailJetWrapper implements MailSender {

  private final MailjetClient mailjetClient;
  private final boolean htmlEmail;

  public MailJetWrapper(String apiKeyPublic, String apiKeyPrivate, boolean htmlEmail) {
    this.htmlEmail = htmlEmail;
    this.mailjetClient = new MailjetClient(ClientOptions.builder().apiKey(apiKeyPublic).apiSecretKey(apiKeyPrivate).build());
  }

  @Override
  public void send(SimpleMailMessage simpleMessage) throws MailException {

    MailjetRequest request = new MailjetRequest(Emailv31.resource)
      .property(Emailv31.MESSAGES, new JSONArray()
        .put(new JSONObject()
          .put(Emailv31.Message.FROM, from(simpleMessage.getFrom()))
          .put(Emailv31.Message.TO, to(simpleMessage.getTo()[0]))
          .put(Emailv31.Message.SUBJECT, simpleMessage.getSubject())
          .put(htmlEmail ? Emailv31.Message.HTMLPART : Emailv31.Message.TEXTPART, simpleMessage.getText())
        ));

    MailjetResponse response;
    int responseStatus;
    try {
      response = mailjetClient.post(request);
      responseStatus = response.getStatus();
    } catch (MailjetException e) {
      throw new TechnicalException(e);
    }

    if (responseStatus != 200 && responseStatus != 201) {
      throw new TechnicalException("MailJet response was not success, it was " + response);
    }
  }


  @Override
  public void send(SimpleMailMessage... simpleMessages) {
    for (SimpleMailMessage simpleMessage : simpleMessages) {
      send(simpleMessage);
    }
  }

  private static JSONObject from(String fromEmail) {
    return new JSONObject().put("Email", fromEmail);
  }

  private static JSONArray to(String toEmail) {
    return new JSONArray().put(new JSONObject()
                    .put("Email", toEmail)
                  );
  }
}
