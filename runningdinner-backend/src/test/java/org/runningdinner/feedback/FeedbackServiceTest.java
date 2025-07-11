package org.runningdinner.feedback;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class FeedbackServiceTest {

  private static final String SENDER_EMAIL = "sender@sender.de";
  private static final String MESSAGE_CONTENT = "MessageContent";
  private static final String SENDER_IP = "127.0.0.1";
  
  private static final int TOTAL_NUMBER_OF_PARTICIPANTS = 22;

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);
  
  @Autowired
  private FeedbackService feedbackService;

  @Autowired
  private FeedbackMailSchedulerService feedbackMailSchedulerService;
  
  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private MailSenderFactory mailSenderFactory;
  
  private MailSenderMockInMemory mailSenderInMemory;
  
  @BeforeEach
  public void setUp() {
    this.mailSenderInMemory = testHelperService.getMockedMailSender();
    this.mailSenderInMemory.setUp();
  }
  
  @Test
  public void testCreateFeedbackFromWizard() {
    
    Feedback result = feedbackService.createFeedback(newFeedback("WizardPage", null));
    
    List<Feedback> feedbacks = feedbackService.findAllNotDeliveredFeedbacks();
    assertThat(feedbacks).contains(result);
    
    feedbackMailSchedulerService.deliverFeedback(result);
    
    SimpleMailMessage message = getSentMessageContainingText("WizardPage");
    
    assertEmailContainsFeedbackData(message);
  }
  
  @Test
  public void testCreateFeedbackFromAdminPage() {
    
    RunningDinner runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
    
    Feedback result = feedbackService.createFeedback(newFeedback("AdminPage", runningDinner.getAdminId()));
    
    List<Feedback> feedbacks = feedbackService.findAllNotDeliveredFeedbacks();
    assertThat(feedbacks).contains(result);
    
    feedbackMailSchedulerService.deliverFeedback(result);
    
    SimpleMailMessage message = getSentMessageContainingText("AdminPage");
    assertEmailContainsFeedbackData(message);
    
    assertThat(message.getText()).contains(runningDinner.getId().toString());
  }
  
  private SimpleMailMessage getSentMessageContainingText(String expectedMessage) {
    
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).isNotEmpty();
    Optional<SimpleMailMessage> result = messages
                                            .stream()
                                            .filter(message -> message.getText().contains(expectedMessage))
                                            .findFirst();
    assertThat(result).as("Expecting to find " + expectedMessage + " in " + messages).isPresent();
    return result.get();
  }
  
  private static void assertEmailContainsFeedbackData(SimpleMailMessage emailMessage) {
    
    assertThat(emailMessage.getReplyTo()).isEqualTo(SENDER_EMAIL);
    assertThat(emailMessage.getSubject()).isEqualTo("Feedback received from " + SENDER_EMAIL);
    assertThat(emailMessage.getTo()[0]).isEqualTo("runyourdinner@gmail.com");
    
    String text = emailMessage.getText();
    assertThat(text).contains(MESSAGE_CONTENT);
    assertThat(text).contains(SENDER_IP);

  }
  
  private static Feedback newFeedback(String pageName, String adminId) {
    
    Feedback feedback = new Feedback();
    feedback.setMessage(MESSAGE_CONTENT);
    feedback.setSenderEmail(SENDER_EMAIL);
    feedback.setPageName(pageName);
    feedback.setSenderIp(SENDER_IP);
    feedback.setAdminId(adminId);
    return feedback;
  }
  
}
