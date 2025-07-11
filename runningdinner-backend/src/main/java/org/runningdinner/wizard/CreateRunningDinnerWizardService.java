
package org.runningdinner.wizard;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.RunningDinnerAdminTO;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.ResourceLoader;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.contract.Contract;
import org.runningdinner.contract.ContractService;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.RunningDinnerInfo;
import org.runningdinner.dataimport.ParticipantInputDataListTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CreateRunningDinnerWizardService {

  private static final Logger LOGGER = LoggerFactory.getLogger(CreateRunningDinnerWizardService.class);

  private final RunningDinnerService runningDinnerService;
  
  private final ContractService contractService;
  
  private final ParticipantRepository participantRepository;
  
  private final ObjectMapper objectMapper;
  
  public CreateRunningDinnerWizardService(RunningDinnerService runningDinnerService, ContractService contractService,
			ParticipantRepository participantRepository, ObjectMapper objectMapper) {
		this.runningDinnerService = runningDinnerService;
		this.contractService = contractService;
		this.participantRepository = participantRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional
  public RunningDinner createRunningDinner(RunningDinnerAdminTO runningDinnerTO) {
    
    validateRunningDinnerTO(runningDinnerTO);

    RunningDinnerConfig runningDinnerConfig = runningDinnerTO.getOptions().toRunningDinnerConfigDetached();
    RunningDinnerInfo runningDinnerInfo = runningDinnerTO.getBasicDetails();
    String email = runningDinnerTO.getEmail();
    RunningDinnerType runningDinnerType = runningDinnerTO.getRunningDinnerType();
    AfterPartyLocation afterPartyLocation = runningDinnerTO.getAfterPartyLocation();

    List<Participant> demoParticipants = Collections.emptyList();
    if (runningDinnerType == RunningDinnerType.DEMO) {
    	demoParticipants = readDemoParticipants();
    }

    RunningDinner result;
    
    RegistrationType registrationType = runningDinnerInfo.getRegistrationType();
    if (registrationType == RegistrationType.CLOSED) {
      result = createRunningDinnerWithParticipants(runningDinnerInfo, runningDinnerConfig, email, runningDinnerType, 
                                                   runningDinnerTO.getContract(), afterPartyLocation, demoParticipants);
    }
    else {
      PublicSettings publicSettings = runningDinnerTO.getPublicSettings().toPublicSettingsDetached();
      result = createRunningDinnerWithParticipants(runningDinnerInfo, runningDinnerConfig, publicSettings, email, runningDinnerType, 
                                                   runningDinnerTO.getContract(), afterPartyLocation, demoParticipants);
    }
    
    return result;
  }
  
  @Transactional
  public RunningDinner createRunningDinnerWithParticipants(RunningDinnerInfo runningDinnerInfo, 
                                                           RunningDinnerConfig runningDinnerConfig, 
                                                           String email,
                                                           RunningDinnerType runningDinnerType,
                                                           Contract contract,
                                                           AfterPartyLocation afterPartyLocation,
                                                           List<Participant> participants) {

    RunningDinner result = runningDinnerService.createRunningDinner(runningDinnerInfo, runningDinnerConfig, email, runningDinnerType, afterPartyLocation);
    contractService.createContractIfNeeded(contract, result);
    return saveParticipantsToDinner(result, participants);
  }

  @Transactional
  public RunningDinner createRunningDinnerWithParticipants(RunningDinnerInfo runningDinnerInfo, 
                                                           RunningDinnerConfig runningDinnerConfig, 
                                                           PublicSettings publicSettings,
                                                           String email, 
                                                           RunningDinnerType runningDinnerType,
                                                           Contract contract,
                                                           AfterPartyLocation afterPartyLocation,
                                                           List<Participant> participants) {

    RunningDinner result = runningDinnerService.createRunningDinner(runningDinnerInfo, runningDinnerConfig, publicSettings, email, runningDinnerType, afterPartyLocation);
    contractService.createContractIfNeeded(contract, result);
    return saveParticipantsToDinner(result, participants);
  }

  
  @Transactional
  public RunningDinner saveParticipantsToDinner(RunningDinner runningDinner, List<Participant> participants) {
    
    Long numExistingParticipants = participantRepository.countByAdminId(runningDinner.getAdminId());
    Assert.state(numExistingParticipants == 0, 
                 "Expected no single existing participants in " + runningDinner + " when adding participants, but found " + numExistingParticipants);
    
    saveAndActivateParticipantsToDinner(runningDinner, participants);
    
    return runningDinner;
  }
  
  @Transactional
  public List<Participant> saveAndActivateParticipantsToDinner(RunningDinner runningDinner, List<Participant> participants) {
    
    participants.forEach(p -> { 
      p.setRunningDinner(runningDinner);
      p.setActivatedBy(runningDinner.getEmail());
      p.setActivationDate(LocalDateTime.now());
    });
    LOGGER.info("Saving {} participants for running dinner {}", participants.size(), runningDinner);
    return participantRepository.saveAll(participants);
  }
  
  public void validateMeals(List<MealClass> meals, LocalDate runningDinnerDate) {

    Assert.notEmpty(meals, "No Meals passed!");

    List<Issue> issueList = new ArrayList<>();

    for (MealClass meal : meals) {

      if (StringUtils.isEmpty(meal.getLabel())) {
        issueList.add(new Issue("error_required_meal_label", IssueType.VALIDATION));
      }

      if (meal.getTime() == null) {
        issueList.add(new Issue("error_required_meal_time", IssueType.VALIDATION));
      } else {
        LocalDateTime mealTime = meal.getTime();
        if (!checkMealTimeNotBeforeRunningDinnerTime(mealTime, runningDinnerDate)) {
          issueList.add(new Issue("error_invalid_meal_time", IssueType.VALIDATION));
        }
      }

      if (!issueList.isEmpty()) {
        throw new ValidationException(new IssueList(issueList));
      }
    }

    if (meals.size() >= 4 || meals.size() < 2) {
      throw new ValidationException(new IssueList(new Issue("error_invalid_meal_size", IssueType.VALIDATION)));
    }
  }

  private boolean checkMealTimeNotBeforeRunningDinnerTime(LocalDateTime mealTime, LocalDate runningDinnerDate) {

    LocalDate mealTimeDateWithoutTime = mealTime.toLocalDate();
    return !mealTimeDateWithoutTime.isBefore(runningDinnerDate);
  }

  public void validateOptionsTO(OptionsTO options, LocalDate runningDinnerDate) {

    if (options.getTeamSize() != 2) {
      throw new ValidationException(new IssueList(new Issue("teamSize", "error.invalid.team.size", IssueType.VALIDATION)));
    }

    validateMeals(options.getMeals(), runningDinnerDate);
  }

  public void validateRunningDinnerTO(RunningDinnerAdminTO runningDinnerAdminTO) {

    RunningDinnerService.validateRunningDinnerDate(runningDinnerAdminTO.getBasicDetails().getDate());

    validateOptionsTO(runningDinnerAdminTO.getOptions(), runningDinnerAdminTO.getBasicDetails().getDate());

    RegistrationType registrationType = runningDinnerAdminTO.getBasicDetails().getRegistrationType();
    if (registrationType != RegistrationType.CLOSED && runningDinnerAdminTO.getPublicSettings() == null) {
      throw new ValidationException(new IssueList(new Issue("error.required.publicsettings", IssueType.VALIDATION)));
    }
    
    AfterPartyLocationService.validateAfterPartyLocation(runningDinnerAdminTO.getAfterPartyLocation());
  }
  
  protected ParticipantInputDataListTO readDemoParticipantsToInputDataList() throws IOException {
    Resource demoResource = ResourceLoader.getResource("files/demo-participants.json");
    try (InputStream inputStream = demoResource.getInputStream()) {
    	return objectMapper.readValue(inputStream, ParticipantInputDataListTO.class);
    }
  }
  
  public List<Participant> readDemoParticipants() {
  	List<Participant> result = new ArrayList<>();
  	ParticipantInputDataListTO participantInputDataListTO;
		try {
			participantInputDataListTO = this.readDemoParticipantsToInputDataList();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		int participantNumber = 1;
  	for (ParticipantInputDataTO participantInput : participantInputDataListTO.participants()) {
    	Participant participant = new Participant();
  		ParticipantService.copyFieldsFromInputToParticipant(participantInput, participant);
  		participant.setGeocodingResult(participantInput.getGeocodingResult());
  		participant.setParticipantNumber(participantNumber++);
  		result.add(participant);
  	}
  	return result;
  }

}
