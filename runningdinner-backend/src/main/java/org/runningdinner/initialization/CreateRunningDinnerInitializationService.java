package org.runningdinner.initialization;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.contract.Contract;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class CreateRunningDinnerInitializationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(CreateRunningDinnerInitializationService.class);

  public static final String DEFAULT_DINNER_CREATION_ADDRESS = "clemensstich@googlemail.com";

  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private CreateRunningDinnerWizardService createRunningDinnerWizardService;
  
  @Autowired
  private UrlGenerator urlGenerator;
  
  @Async
  public void createPublicRunningDinnerAsync(LocalDate dinnerDate) {
    
    RunningDinner runningDinnerInfo = newRunningDinnerInfo("Running Dinner in Freiburg", RegistrationType.PUBLIC, dinnerDate); 
    
    RunningDinnerConfig runningDinnerConfig = RunningDinnerConfig.newConfigurer().havingMeals(newDefaultMeals(dinnerDate)).build();
    
    PublicSettings publicSettings = new PublicSettings("Running Dinner in Freiburg", generatePublicDescription(), dinnerDate.minusDays(5), false);
    publicSettings.setPublicContactEmail(DEFAULT_DINNER_CREATION_ADDRESS);
    publicSettings.setPublicContactName("Max Mustermann");
    RunningDinner result = runningDinnerService.createRunningDinner(runningDinnerInfo, runningDinnerConfig, publicSettings, 
                                                                    DEFAULT_DINNER_CREATION_ADDRESS, RunningDinnerType.STANDARD, null);

    acknowledgeRunningDinner(result);
    
    printRunningDinnerInfo(result);
  }
  
  @Async
  public void createClosedRunningDinnerAsync(LocalDate dinnerDate) {
    
    RunningDinner runningDinnerInfo = newRunningDinnerInfo("Closed Dinner", RegistrationType.CLOSED, dinnerDate);
    
    RunningDinnerConfig runningDinnerConfig = RunningDinnerConfig.newConfigurer().havingMeals(newDefaultMeals(dinnerDate)).build();
   
    List<Participant> participants = ParticipantService.newParticipantsFromDemoXls(); 
    Contract contract = CreateRunningDinnerInitializationService.createContract();
    RunningDinner result = createRunningDinnerWizardService.createRunningDinnerWithParticipants(runningDinnerInfo, runningDinnerConfig, DEFAULT_DINNER_CREATION_ADDRESS, 
                                                                                                RunningDinnerType.STANDARD, contract, null, participants);
    
    acknowledgeRunningDinner(result);
    
    printRunningDinnerInfo(result);
  }

  private static RunningDinner newRunningDinnerInfo(String title, RegistrationType registrationType, LocalDate dinnerDate) {

    RunningDinner runningDinnerInfo = new RunningDinner();
    runningDinnerInfo.setTitle(title);
    runningDinnerInfo.setCity("Freiburg");
    runningDinnerInfo.setZip("79100");
    runningDinnerInfo.setDate(dinnerDate);
    runningDinnerInfo.setRegistrationType(registrationType);
    runningDinnerInfo.setLanguageCode(CoreUtil.getDefaultLocale().getLanguage());
    return runningDinnerInfo;
  }
  
  private RunningDinner acknowledgeRunningDinner(RunningDinner runningDinner) {
    
    return runningDinnerService.acknowledgeRunningDinner(runningDinner.getAdminId(), runningDinner.getObjectId(), LocalDateTime.now());
  }
  
  private static List<MealClass> newDefaultMeals(LocalDate dinnerDate) {

    List<MealClass> result = new ArrayList<>();
    result.add(new MealClass("Vorspeise", LocalDateTime.of(dinnerDate, LocalTime.of(19, 00))));
    result.add(new MealClass("Hauptspeise", LocalDateTime.of(dinnerDate, LocalTime.of(21, 00))));
    result.add(new MealClass("Nachspeise", LocalDateTime.of(dinnerDate, LocalTime.of(23, 00))));
    return result;
  }
  
  private void printRunningDinnerInfo(RunningDinner runningDinner) {

    String adminUrl = urlGenerator.constructAdministrationUrl(runningDinner.getAdminId());
    String publicUrl = runningDinner.getRegistrationType() != RegistrationType.CLOSED ? urlGenerator.constructPublicDinnerUrl(runningDinner.getPublicSettings().getPublicId()) : "";

    LOGGER.info("*** CREATED {} DINNER: ***", runningDinner.getRegistrationType());
    LOGGER.info("ADMIN-URL: {}", adminUrl);
    LOGGER.info("PUBLIC-URL: {} ", publicUrl);
  }
  
  public static Contract createContract() {
    
    Contract contract = new Contract();
    contract.setAdvAcknowledged(true);
    contract.setCity("Freiburg");
    contract.setEmail(DEFAULT_DINNER_CREATION_ADDRESS);
    contract.setStreetWithNr("Musterstr. 1");
    contract.setZip("79100");
    contract.setFullname("Max Mustermann");
    contract.setIp("127.0.0.1");
    return contract;
  }

  private static String generatePublicDescription() {
    
    // Range between 500 and 1000 chars
    int maxLen =  ThreadLocalRandom.current().nextInt(500, 1000 + 1);
    String loremIpsum = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
    return StringUtils.truncate(loremIpsum, maxLen);
  }

}
