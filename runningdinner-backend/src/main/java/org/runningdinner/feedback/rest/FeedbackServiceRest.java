package org.runningdinner.feedback.rest;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.runningdinner.feedback.Feedback;
import org.runningdinner.feedback.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/feedbackservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class FeedbackServiceRest {

  @Autowired
  private FeedbackService feedbackService;
  
  @RequestMapping(value = "/feedback", method = RequestMethod.POST)
  public Feedback createFeedback(@Valid @RequestBody Feedback incomingFeedback, HttpServletRequest request) {

    String senderIp = request.getRemoteAddr();
    incomingFeedback.setSenderIp(senderIp);
    return feedbackService.createFeedback(incomingFeedback);
  }
}
