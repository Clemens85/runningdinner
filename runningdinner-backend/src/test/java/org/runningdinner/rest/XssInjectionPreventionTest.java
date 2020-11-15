package org.runningdinner.rest;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.apache.commons.lang3.StringUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
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
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"dev", "junit"})
public class XssInjectionPreventionTest {

  private static final String BASE_URI = "http://localhost";

  @Value("${local.server.port}")
  private int port;

//  @Value("${server.contextPath}")
  private String contextPath = StringUtils.EMPTY;
  
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
