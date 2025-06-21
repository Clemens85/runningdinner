package org.runningdinner.rest;

import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.wizard.BasicDetailsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "deliver.feedback.mail.scheduler.enabled=false",
        "delete.runninginnder.instances.scheduler.enabled=false",
        "send.queued.messagetasks.scheduler.enabled=false",
        "sendgrid.sync.sent.mails=false",
        "route.optimization.send.feedback=false",
        "aws.sqs.geocode.request.url=geocode-request-junit",
        "aws.sqs.geocode.response.url=geocode-response-junit",
        "geocode.response.scheduler.enabled=false",
        "mail.smtp.enabled=false",
        "mail.junit.from=dev@runyourdinner.eu"
})
@ActiveProfiles({"dev", "junit"})
public class XssInjectionPreventionTest {

  private static final String BASE_URI = "http://localhost";

  @Value("${local.server.port}")
  private int port;

  private final String contextPath = StringUtils.EMPTY;
  
  @Autowired
  private TestRestTemplate restTemplate;
  
  protected String getBaseUri() {

    return BASE_URI + ":" + port + contextPath;
  }
  
  @Test
  public void testScriptInjection() {
    
    String url = getBaseUri() + "/rest/wizardservice/v1/validate/basicdetails";

    BasicDetailsTO basicDetails = newBasicDetails();
    basicDetails.setTitle("<script>alert('Test');</script>");
    
    HttpEntity<BasicDetailsTO> httpEntity = new HttpEntity<>(basicDetails);
    
    ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.PUT, httpEntity, Void.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_ACCEPTABLE);
  }
  
  private BasicDetailsTO newBasicDetails() {
    
    BasicDetailsTO basicDetails = new BasicDetailsTO();
    basicDetails.setRegistrationType(RegistrationType.CLOSED);
    basicDetails.setDate(LocalDate.now().plusDays(28));
    basicDetails.setZip("79100");
    basicDetails.setCity("Freiburg");
    return basicDetails;
  }
}
