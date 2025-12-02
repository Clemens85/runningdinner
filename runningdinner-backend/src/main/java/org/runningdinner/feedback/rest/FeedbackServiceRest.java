package org.runningdinner.feedback.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.feedback.Feedback;
import org.runningdinner.feedback.FeedbackConversation;
import org.runningdinner.feedback.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/rest/feedbackservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class FeedbackServiceRest {

  @Autowired
  private FeedbackService feedbackService;
  
  @PostMapping("/feedback")
  public Feedback createFeedback(@Valid @RequestBody Feedback incomingFeedback, HttpServletRequest request) {
    String senderIp = request.getRemoteAddr();
    incomingFeedback.setSenderIp(senderIp);
    return feedbackService.createFeedback(incomingFeedback, LocalDateTime.now());
  }

  @PostMapping("/feedback/conversations")
  public void createFeedbackConversations(@Valid @RequestBody List<FeedbackConversation> feedbackConversations) {
    feedbackService.createFeedbackConversations(feedbackConversations);
  }

  @PutMapping("/feedback/{threadId}/resolved/{resolved}")
  public Feedback updateResolvedStatus(@PathVariable UUID threadId, @PathVariable FuzzyBoolean resolved) {
    return feedbackService.updateResolvedStatus(threadId, resolved);
  }
}
