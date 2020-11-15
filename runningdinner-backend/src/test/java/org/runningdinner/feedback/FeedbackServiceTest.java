package org.runningdinner.feedback;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
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
  
  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    this.mailSenderInMemory = (MailSenderMockInMemory) mailSenderFactory.getMailSender(); // Test uses always this implementation
    this.mailSenderInMemory.setUp();
    this.mailSenderInMemory.addIgnoreRecipientEmail(CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
  }
  
  @Test
  public void testCreateFeedbackFromWizard() {
    
    Feedback result = feedbackService.createFeedback(newFeedback("WizardPage", null));
    
    List<Feedback> feedbacks = feedbackService.findAllNotDeliveredFeedbacks();
    assertThat(feedbacks).contains(result);
    
    feedbackMailSchedulerService.deliverFeedback(result);
    
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).hasSize(1);
    SimpleMailMessage message = messages.iterator().next();
    
    assertEmailContainsFeedbackData(message, "WizardPage");
  }
  
  @Test
  public void testCreateFeedbackFromAdminPage() {
    
    RunningDinner runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
    
    Feedback result = feedbackService.createFeedback(newFeedback("AdminPage", runningDinner.getAdminId()));
    
    List<Feedback> feedbacks = feedbackService.findAllNotDeliveredFeedbacks();
    assertThat(feedbacks).contains(result);
    
    feedbackMailSchedulerService.deliverFeedback(result);
    
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).hasSize(1);
    SimpleMailMessage message = messages.iterator().next();
    
    assertEmailContainsFeedbackData(message, "AdminPage");
    
    assertThat(message.getText()).contains(runningDinner.getId().toString());
  }
  
  private static void assertEmailContainsFeedbackData(SimpleMailMessage emailMessage, String expectedPageName) {
    
    assertThat(emailMessage.getReplyTo()).isEqualTo(SENDER_EMAIL);
    assertThat(emailMessage.getSubject()).isEqualTo("Feedback received from " + SENDER_EMAIL);
    assertThat(emailMessage.getTo()[0]).isEqualTo("runyourdinner@gmail.com");
    
    String text = emailMessage.getText();
    assertThat(text).contains(MESSAGE_CONTENT);
    assertThat(text).contains(expectedPageName);
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
