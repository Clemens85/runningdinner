package org.runningdinner.test.util;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.web.WebAppConfiguration;

@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
  properties = {
    "deliver.feedback.mail.scheduler.enabled=false",
    "delete.runninginnder.instances.scheduler.enabled=false",
    "send.queued.messagetasks.scheduler.enabled=false",
    "sendgrid.sync.sent.mails=false",
    "route.optimization.send.feedback=false",
    "aws.sqs.geocode.request.url=geocode-request-junit",
    "aws.sqs.geocode.response.url=geocode-response-junit",
    "geocode.response.scheduler.enabled=false"
  }
)
@WebAppConfiguration
@ActiveProfiles({"dev", "junit"})
public @interface ApplicationTest {

}