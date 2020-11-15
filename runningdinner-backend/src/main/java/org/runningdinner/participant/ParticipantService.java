
package org.runningdinner.participant;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.ResourceLoader;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.AssignableParticipantSizes;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.converter.ConversionException;
import org.runningdinner.core.converter.ConverterFactory;
import org.runningdinner.core.converter.ConverterFactory.INPUT_FILE_TYPE;
import org.runningdinner.core.converter.FileConverter;
import org.runningdinner.core.converter.config.AddressColumnConfig;
import org.runningdinner.core.converter.config.EmailColumnConfig;
import org.runningdinner.core.converter.config.GenderColumnConfig;
import org.runningdinner.core.converter.config.NameColumnConfig;
import org.runningdinner.core.converter.config.NumberOfSeatsColumnConfig;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.ParticipantGeocodeEventPublisher;
import org.runningdinner.participant.partnerwish.TeamPartnerWishStateHandlerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.google.common.collect.Lists;

@Service
public class ParticipantService {

  private static Logger LOGGER = LoggerFactory.getLogger(ParticipantService.class);

  @Autowired
  private ParticipantRepository participantRepository;

  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private ValidatorService validatorService;
  
  @Autowired
  private TeamPartnerWishStateHandlerService teamPartnerWishStateHandlerService;

  @Autowired
  private ParticipantGeocodeEventPublisher participantGeocodeEventPublisher;

  public Participant findParticipantById(@ValidateAdminId String adminId, UUID participantId) {

    Participant result = participantRepository.findByIdAndAdminId(participantId, adminId);
    validatorService.checkEntityNotNull(result);
    return result;
  }

  public List<Participant> findParticipantsByIds(@ValidateAdminId String adminId, Set<UUID> participantIds) {

    return participantRepository.findByIdInAndAdminIdOrderByParticipantNumber(participantIds, adminId);
  }
  
  public List<Participant> findNotActivatedParticipantsByIds(@ValidateAdminId String adminId, Set<UUID> participantIds) {

    return participantRepository.findByIdInAndActivationDateIsNullAndAdminIdOrderByParticipantNumber(participantIds, adminId);
  }

  public List<Participant> findParticipants(@ValidateAdminId String adminId, boolean onlyActiveParticipants) { 

    if (onlyActiveParticipants) {
      return participantRepository.findByAdminIdAndActivationDateIsNotNullOrderByParticipantNumber(adminId);
    }
    return participantRepository.findByAdminIdOrderByParticipantNumber(adminId);
  }
  
  public List<Participant> findActiveParticipantsAssignedToTeam(@ValidateAdminId String adminId) {

    return participantRepository.findByAdminIdAndTeamIdIsNotNullAndActivationDateIsNotNullOrderByParticipantNumber(adminId);
  }
  
  public List<Participant> findActiveParticipantsNotAssignedToTeam(@ValidateAdminId String adminId) {

    return participantRepository.findByAdminIdAndTeamIdIsNullAndActivationDateIsNotNullOrderByParticipantNumber(adminId);
  }

  @Transactional(readOnly = true)
  public List<Participant> findActiveParticipantsWithAssignableInfo(@ValidateAdminId String adminId) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<Participant> participants = participantRepository.findByAdminIdAndActivationDateIsNotNullOrderByParticipantNumber(adminId);

    participants.stream().filter(p -> p.getTeamId() != null).forEach(p -> p.setAssignmentType(AssignmentType.ASSIGNED_TO_TEAM));

    List<Participant> participantsWithoutTeams = participants.stream().filter(p -> p.getTeamId() == null).collect(Collectors.toList());
    setAssignableInformation(participantsWithoutTeams, runningDinner);

    return participants;
  }

  private void setAssignableInformation(List<Participant> participantsWithoutTeam, RunningDinner runningDinner) {

    AssignableParticipantSizes assignableParticipantSizes = AssignableParticipantSizes.create(runningDinner.getConfiguration());
    int nextParticipantsOffsetSize = assignableParticipantSizes.getNextParticipantsOffsetSize();
    int minimumParticipantsNeeded = assignableParticipantSizes.getMinimumParticipantsNeeded();

    if (participantsWithoutTeam.size() < minimumParticipantsNeeded) {
      participantsWithoutTeam.forEach(p -> p.setAssignmentType(AssignmentType.NOT_ASSIGNABLE));
      return;
    }

    participantsWithoutTeam.stream().limit(minimumParticipantsNeeded).forEach(p -> p.setAssignmentType(AssignmentType.ASSIGNABLE));

    List<Participant> remainingParticipants = participantsWithoutTeam.size() == minimumParticipantsNeeded ? Collections.emptyList() : participantsWithoutTeam.subList(
      minimumParticipantsNeeded, participantsWithoutTeam.size());

    if (remainingParticipants.size() < nextParticipantsOffsetSize) {
      remainingParticipants.stream().forEach(p -> p.setAssignmentType(AssignmentType.NOT_ASSIGNABLE));
    } else {
      List<List<Participant>> remainingParticipantChunks = Lists.partition(remainingParticipants, nextParticipantsOffsetSize);
      for (List<Participant> participantChunk : remainingParticipantChunks) {
        boolean assignable = participantChunk.size() >= nextParticipantsOffsetSize;
        participantChunk.stream().forEach(p -> p.setAssignmentType(assignable ? AssignmentType.ASSIGNABLE : AssignmentType.NOT_ASSIGNABLE));
      }
    }
  }


  /**
   * Updates existing participant of a running dinner
   * 
   * @param adminId
   * @param participantId
   * @param incomingParticipant
   * @return
   */
  @Transactional
  public Participant updateParticipant(@ValidateAdminId String adminId, UUID participantId, final Participant incomingParticipant) {

    LOGGER.info("Update participant {}", participantId);

    Participant existingParticipant = participantRepository.findByIdAndAdminId(participantId, adminId);
    validatorService.checkEntityNotNull(existingParticipant, "Could not load participant " + participantId + " for dinner " + adminId);
    
    checkNoOtherParticipantHasEmail(existingParticipant, incomingParticipant.getEmail());
    TeamPartnerWishStateHandlerService.checkEmailDoesNotEqualTeamPartnerWish(incomingParticipant);

    copyFields(existingParticipant, incomingParticipant);

    Participant result = participantRepository.save(existingParticipant);

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    putGeocodeEventToQueue(result, runningDinner);

    return result;
  }

  @Transactional
  public Participant updateParticipantGeocode(String adminId, UUID participantId, GeocodingResult incomingGeocodingResult) {

    LOGGER.info("Update geocode of participant {}", participantId);

    Participant existingParticipant = participantRepository.findByIdAndAdminId(participantId, adminId);
    validatorService.checkEntityNotNull(existingParticipant, "Could not load participant " + participantId + " for dinner " + adminId);

    existingParticipant.setGeocodingResult(incomingGeocodingResult);

    return participantRepository.save(existingParticipant);
  }

  /**
   * Adds a new participant to the running dinner identified by dinner admin id
   * 
   * @param adminId
   * @param incomingParticipant
   * @return
   */
  @Transactional
  public Participant addParticipant(@ValidateAdminId String adminId, Participant incomingParticipant) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    return addParticipant(runningDinner, incomingParticipant, false);
  }

  /**
   * Adds a new participant to the passed running dinner
   * 
   * @param runningDinner
   * @param incomingParticipant
   * @return
   */
  @Transactional
  public Participant addParticipant(RunningDinner runningDinner, Participant incomingParticipant, boolean participantSubscription) {

    checkDuplicatedRegistration(runningDinner.getAdminId(), incomingParticipant.getEmail());
    TeamPartnerWishStateHandlerService.checkEmailDoesNotEqualTeamPartnerWish(incomingParticipant);
    
    Participant participant = new Participant();
    copyFields(participant, incomingParticipant);

    int participantNumber = getNextParticipantNumber(runningDinner);
    participant.setParticipantNumber(participantNumber);

    participant.setRunningDinner(runningDinner);
    
    if (!participantSubscription) {
      participant.setActivatedBy(runningDinner.getEmail());
      participant.setActivationDate(LocalDateTime.now());
    }
      
    Participant createdParticipant = participantRepository.save(participant);

    putGeocodeEventToQueue(createdParticipant, runningDinner);

    return createdParticipant;
  }
  
  @Transactional
  public Participant updateParticipantSubscription(UUID participantId, LocalDateTime now, boolean activatedByParticipant, RunningDinner runningDinner) {

    LOGGER.info("Update activation state of participant {}", participantId);
    
    checkActivationValidForDinner(runningDinner);

    Participant existingParticipant = participantRepository.findByIdAndAdminId(participantId, runningDinner.getAdminId());
    validatorService.checkEntityNotNull(existingParticipant, "Could not load participant " + participantId + " for dinner " + runningDinner.getAdminId());
    
    String activatedBy = existingParticipant.getEmail();
    if (!activatedByParticipant) {
      activatedBy = runningDinner.getEmail();
    }
    
    existingParticipant.setActivatedBy(activatedBy);
    existingParticipant.setActivationDate(now);

    Participant result = participantRepository.save(existingParticipant);
    
    teamPartnerWishStateHandlerService.handleTeamPartnerWishForSubscribedParticipant(result, runningDinner);
   
    return result;
  }
  
  
  protected int getNextParticipantNumber(RunningDinner runningDinner) {

    int result = 1;
    Optional<Participant> participant = participantRepository.findFirstByAdminIdOrderByParticipantNumberDesc(runningDinner.getAdminId());
    if (participant.isPresent()) {
      result = participant.get().getParticipantNumber() + 1;
      if (result > FileConverter.MAX_PARTICIPANTS) {
        throw new ValidationException(new IssueList(new Issue(IssueKeys.TOO_MANY_PARTICIPANTS, IssueType.TECHNICAL)));
      }
    }
    return result;
  }

  protected void copyFields(Participant existingParticipant, Participant incomingParticipant) {

    existingParticipant.setGender(incomingParticipant.getGender());

    existingParticipant.setEmail(incomingParticipant.getEmail());

    existingParticipant.setNumSeats(incomingParticipant.getNumSeats());

    existingParticipant.setName(ParticipantName.newName().withFirstname(incomingParticipant.getName().getFirstnamePart()).andLastname(
      incomingParticipant.getName().getLastname()));

    existingParticipant.setAddress(new ParticipantAddress(incomingParticipant.getAddress().getStreet(),
      incomingParticipant.getAddress().getStreetNr(), incomingParticipant.getAddress().getZip()));
    existingParticipant.getAddress().setCityName(incomingParticipant.getAddress().getCityName());
    existingParticipant.getAddress().setRemarks(incomingParticipant.getAddress().getRemarks());
    existingParticipant.getAddress().setAddressName(incomingParticipant.getAddress().getAddressName());

    existingParticipant.setAge(incomingParticipant.getAge());
    existingParticipant.setMobileNumber(incomingParticipant.getMobileNumber());

    existingParticipant.setMealSpecifics(incomingParticipant.getMealSpecifics());
    existingParticipant.setNotes(incomingParticipant.getNotes());
    existingParticipant.setTeamPartnerWish(incomingParticipant.getTeamPartnerWish());
  }

  public Optional<Participant> findParticipantByEmail(String adminId, String email) {

    if (StringUtils.isEmpty(email)) {
      return Optional.empty();
    }
    String normalizedEmail = email.trim();
    return participantRepository.findByEmailIgnoreCaseAndAdminId(normalizedEmail, adminId);
  }

  public void checkDuplicatedRegistration(String dinnerAdminId, String email) {

    Optional<Participant> existingParticipant = findParticipantByEmail(dinnerAdminId, email);
    if (existingParticipant.isPresent()) {
      throw new ValidationException(new IssueList(new Issue("email", IssueKeys.PARTICIPANT_ALREADY_REGISTERED, IssueType.VALIDATION)));
    }
  }
  
  @Transactional
  public void deleteParticipant(@ValidateAdminId String adminId, UUID participantId) {

    LOGGER.info("Try to delete participant {}", participantId);

    Participant participant = participantRepository.findByIdAndAdminId(participantId, adminId);
    validatorService.checkEntityNotNull(participant, "Could not find " + participantId + " to be deleted from running dinner " + adminId);
    
    if (participant.getTeamId() != null) {
      throw new ValidationException(new IssueList(new Issue("teamId", IssueKeys.PARTICIPANT_ASSINGED_IN_TEAM, IssueType.VALIDATION)));
    }

    participantRepository.delete(participant);
  }
  
  public static void removeTeamReferences(Collection<Participant> participants) {
    
    for (Participant participant : participants) {
      participant.removeTeamReference();
    }
  }
  
  public static List<Participant> newParticipantsFromDemoXls() {
    
    NameColumnConfig nameColumnConfig = NameColumnConfig.createForOneColumn(0);
    AddressColumnConfig addressColumnConfig = AddressColumnConfig.newBuilder().withStreetAndStreetNrColumn(1).buildWithZipAndCityColumn(2);
    NumberOfSeatsColumnConfig numberSeatsColumnConfig = NumberOfSeatsColumnConfig.newNumericSeatsColumnConfig(3);
    ParsingConfiguration parsingConfiguration = new ParsingConfiguration(nameColumnConfig, addressColumnConfig, numberSeatsColumnConfig);
    parsingConfiguration.setEmailColumnConfig(EmailColumnConfig.createEmailColumnConfig(4));
    parsingConfiguration.setGenderColumnConfig(GenderColumnConfig.createGenderColumn(5));
    parsingConfiguration.setStartRow(1);

    FileConverter fileConverter = ConverterFactory.newFileConverter(parsingConfiguration, INPUT_FILE_TYPE.HSSF);
    
    Resource demoResource = ResourceLoader.getResource("files/demo.xls");
    try (InputStream inputStream = demoResource.getInputStream()) {
      return fileConverter.parseParticipants(inputStream);
    } catch (IOException | ConversionException e) {
      throw new TechnicalException(e);
    }
  }
  
  private void checkNoOtherParticipantHasEmail(Participant participant, String newEmailAddress) {

    List<Participant> participants = participantRepository.findByEmailIgnoreCaseAndIdNotAndAdminId(newEmailAddress, participant.getId(), participant.getAdminId());
    if (CollectionUtils.isNotEmpty(participants)) {
      throw new ValidationException(new IssueList(new Issue("email", IssueKeys.PARTICIPANT_ALREADY_REGISTERED, IssueType.VALIDATION)));
    }
  }
  
  private static void checkActivationValidForDinner(RunningDinner runningDinner) {

    if (runningDinner.getRunningDinnerType() == RunningDinnerType.DEMO) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.PARTICIPANT_ACTIVATION_INVALID_DEMO_DINNER, IssueType.VALIDATION)));
    }
  }

  private void putGeocodeEventToQueue(final Participant participant, final RunningDinner runningDinner) {
    
    if (runningDinner.getRunningDinnerType() == RunningDinnerType.DEMO) {
      return;
    }
    
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
      @Override
      public void afterCompletion(int status) {
        if (status != TransactionSynchronization.STATUS_COMMITTED) {
          return;
        }
        
        try {
          participantGeocodeEventPublisher.sendMessageToQueueAsync(participant);
        } catch (Exception e) { 
          LOGGER.error("Error while calling sendMessageToQueueAsync for {}", participant, e);
        }
      }
    });
  }


}
