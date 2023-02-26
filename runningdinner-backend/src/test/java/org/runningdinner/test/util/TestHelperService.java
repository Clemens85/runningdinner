
package org.runningdinner.test.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.awaitility.Awaitility;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.contract.Contract;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.RunningDinnerInfo;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
public class TestHelperService {

  private static final long MAX_AWAIT_SECONDS = 4;

  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private MessageService messageService;

  @Autowired
  private CreateRunningDinnerWizardService createRunningDinnerWizardService;
  
  @Autowired
  private ParticipantRepository participantRepository;

  public RunningDinner createClosedRunningDinner(LocalDate date, String email) {

    RunningDinnerInfo info = TestUtil.newBasicDetails("title", date, "Freiburg");

    List<Participant> participants = ParticipantGenerator.generateParticipants(18);

    Contract contract = CreateRunningDinnerInitializationService.createContract();
    RunningDinner result = createRunningDinnerWizardService.createRunningDinnerWithParticipants(info, getDefaultRunningDinnerConfig(date), email, RunningDinnerType.STANDARD, 
                                                                                                contract, participants);

    Assert.notNull(result, "runningDinner");
    Assert.hasLength(result.getAdminId(), "adminId");

    return acknowledgeRunningDinner(result);
  }

  public RunningDinner createPublicRunningDinner(LocalDate date, int numDaysRegistrationEndsBeforeDate) {

    return createPublicRunningDinner(date, numDaysRegistrationEndsBeforeDate, RegistrationType.PUBLIC, true);
  }

  public RunningDinner createPublicRunningDinner(LocalDate date, int numDaysRegistrationEndsBeforeDate, RegistrationType registrationType, boolean autoAcknowledge) {

    LocalDate endOfRegistrationDate = date.minusDays(numDaysRegistrationEndsBeforeDate);

    RunningDinnerInfo runningDinnerInfo = TestUtil.newBasicDetails("Title", date, "City", registrationType);

    PublicSettings publicSettings = new PublicSettings("Public Title", "Public Description", endOfRegistrationDate, false);
    publicSettings.setPublicContactEmail(CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    RunningDinner result = runningDinnerService.createRunningDinner(runningDinnerInfo, getDefaultRunningDinnerConfig(date), publicSettings, 
                                                                    CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS, RunningDinnerType.STANDARD);
    
    if (!autoAcknowledge) {
      return result;
    }
    return acknowledgeRunningDinner(result);
  }

  public RunningDinner createClosedRunningDinnerWithParticipants(LocalDate date, int numParticipants) {

    return createRunningDinnerWithParticipants(date, numParticipants, RegistrationType.CLOSED);
  }
  
  public RunningDinner createOpenRunningDinnerWithParticipants(LocalDate date, int numParticipants) {

    return createRunningDinnerWithParticipants(date, numParticipants, RegistrationType.OPEN);
  }
  
  private RunningDinner createRunningDinnerWithParticipants(LocalDate date, int numParticipants, RegistrationType registrationType) {

    Contract contract = CreateRunningDinnerInitializationService.createContract();
    
    RunningDinnerInfo info = TestUtil.newBasicDetails("RunningDinner", date, "Freiburg", registrationType);
    List<Participant> participants = ParticipantGenerator.generateParticipants(numParticipants);
    RunningDinner result;
    if (registrationType.isClosed()) {
      result = createRunningDinnerWizardService.createRunningDinnerWithParticipants(
        info, getDefaultRunningDinnerConfig(date), CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS, RunningDinnerType.STANDARD, contract, participants);
    } else {
      PublicSettings publicSettings = new PublicSettings("Public Title", "Public Description", date.minusDays(2), false);
      result = createRunningDinnerWizardService.createRunningDinnerWithParticipants(
        info, getDefaultRunningDinnerConfig(date), publicSettings, CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS, RunningDinnerType.STANDARD, contract,
        participants);
    }
    return acknowledgeRunningDinner(result);
  }
  
  
  @Transactional
  public List<Participant> saveParticipants(List<Participant> participants) {
    
    return participantRepository.saveAll(participants);
  }

  private RunningDinnerConfig getDefaultRunningDinnerConfig(LocalDate date) {

    return RunningDinnerConfig.newConfigurer().havingMeals(newDefaultMeals(date)).build();
  }

  public static List<MealClass> newDefaultMeals(LocalDate dinnerDate) {

    List<MealClass> result = new ArrayList<>();
    result.add(new MealClass("Vorspeise", LocalDateTime.of(dinnerDate, LocalTime.of(19, 00))));
    result.add(new MealClass("Hauptspeise", LocalDateTime.of(dinnerDate, LocalTime.of(21, 00))));
    result.add(new MealClass("Nachspeise", LocalDateTime.of(dinnerDate, LocalTime.of(23, 00))));
    return result;
  }

  public void awaitMessageJobFinished(MessageJob messageJob) {
    
    Awaitility
      .await()
      .atMost(MAX_AWAIT_SECONDS, TimeUnit.SECONDS)
      .until(messageJobIsFinished(messageJob));
  }
  
  private Callable<Boolean> messageJobIsFinished(MessageJob incomingMessageJob) {
    
    return new Callable<Boolean>() {
      @Override
      public Boolean call() throws Exception {
        MessageJob messageJob = messageService.findMessageJob(incomingMessageJob.getAdminId(), incomingMessageJob.getId());
        return messageJob.getSendingStatus() == SendingStatus.SENDING_FINISHED;
      }
    };
  }
  
  private RunningDinner acknowledgeRunningDinner(RunningDinner runningDinner) {
    
    return runningDinnerService.acknowledgeRunningDinner(runningDinner.getAdminId(), runningDinner.getObjectId(), LocalDateTime.now());
  }
}
