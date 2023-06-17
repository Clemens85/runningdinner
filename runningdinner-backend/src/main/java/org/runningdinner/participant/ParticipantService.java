
package org.runningdinner.participant;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
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
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.AssignableParticipantSizes;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.Gender;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.converter.ConversionException;
import org.runningdinner.core.converter.ConverterFactory;
import org.runningdinner.core.converter.ConverterFactory.INPUT_FILE_TYPE;
import org.runningdinner.core.converter.ConverterWriteContext;
import org.runningdinner.core.converter.FileConverter;
import org.runningdinner.core.converter.config.AddressColumnConfig;
import org.runningdinner.core.converter.config.EmailColumnConfig;
import org.runningdinner.core.converter.config.GenderColumnConfig;
import org.runningdinner.core.converter.config.NameColumnConfig;
import org.runningdinner.core.converter.config.NumberOfSeatsColumnConfig;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.ParticipantGeocodeEventPublisher;
import org.runningdinner.mail.formatter.MessageFormatterHelperService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishStateHandlerService;
import org.runningdinner.participant.rest.MissingParticipantsInfo;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.participant.rest.ParticipantListActive;
import org.runningdinner.participant.rest.ParticipantWithListNumberTO;
import org.runningdinner.participant.rest.TeamPartnerWishRegistrationDataTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

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

  @Autowired
  private MessageFormatterHelperService messageFormatterHelperService;

  @Autowired
  private LocalizationProviderService localizationProviderService;

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
  public ParticipantListActive findActiveParticipantList(@ValidateAdminId String adminId) {
  	
    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    final List<Participant> allParticipants = participantRepository.findByAdminIdAndActivationDateIsNotNullOrderByParticipantNumber(adminId);
    final int numParticipantsTotal = allParticipants.size();
    
    final AssignableParticipantSizes assignableParticipantSizes = AssignableParticipantSizes.create(runningDinner.getConfiguration());
    final int minimumParticipantsNeeded = assignableParticipantSizes.getMinimumParticipantsNeeded();
    
    List<Participant> participantsAssignedIntoTeams = filterParticipantsAssignedIntoTeams(allParticipants);
    boolean hasExistingTeams = CollectionUtils.isNotEmpty(participantsAssignedIntoTeams);
    
    List<Participant> participants;
    List<Participant> participantsWaitingList = Collections.emptyList();
    MissingParticipantsInfo missingParticipantsInfo;
    
    if (hasExistingTeams) {
    	participants = participantsAssignedIntoTeams;
      Set<Participant> participantsWaitingListAsSet = CoreUtil.excludeMultipleFromSet(participantsAssignedIntoTeams, new HashSet<>(allParticipants));
      participantsWaitingList = new ArrayList<>(participantsWaitingListAsSet);
      Collections.sort(participantsWaitingList);
      missingParticipantsInfo = MissingParticipantsInfo.newWithExistingTeams(minimumParticipantsNeeded);
    } else {
      int numParticipantsMissing = minimumParticipantsNeeded - numParticipantsTotal;
  		missingParticipantsInfo = MissingParticipantsInfo.newMissingParticipantsInfo(minimumParticipantsNeeded, Math.max(numParticipantsMissing, 0));
  		
  		int nextParticipantsOffsetSize = assignableParticipantSizes.getNextParticipantsOffsetSize();
      if (allParticipants.size() >= minimumParticipantsNeeded && numParticipantsTotal % nextParticipantsOffsetSize != 0) {
      	int numNotAssignableParticipants = numParticipantsTotal % nextParticipantsOffsetSize;
      	participantsWaitingList = allParticipants.subList(numParticipantsTotal - numNotAssignableParticipants, numParticipantsTotal);
      	participants = allParticipants.subList(0, numParticipantsTotal - numNotAssignableParticipants);
      } else {
      	participants = allParticipants;
      }
    }
    
    ParticipantListActive result = new ParticipantListActive();
    result.setTeamsGenerated(hasExistingTeams);
    result.setNumParticipantsTotal(numParticipantsTotal);
    result.setParticipants(applyListNumbers(participants, 1));
    result.setParticipantsWaitingList(applyListNumbers(participantsWaitingList, participants.size() + 1));
    result.setMissingParticipantsInfo(missingParticipantsInfo);
    return result;
  }

  @Transactional(readOnly = true)
  public void exportParticipantsAsExcel(@ValidateAdminId String adminId, OutputStream outputStream) throws IOException {

    List<Participant> participants = findParticipants(adminId, true);

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);

    ParsingConfiguration parsingConfiguration = ParsingConfiguration.newDefaultConfiguration();
    FileConverter fileConverter = ConverterFactory.newFileConverter(parsingConfiguration, INPUT_FILE_TYPE.XSSF);
    fileConverter.writeParticipants(participants, outputStream,
        new ConverterWriteContext(locale, messageFormatterHelperService));
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
  public Participant updateParticipant(@ValidateAdminId String adminId, UUID participantId, final ParticipantInputDataTO incomingParticipant) {

    LOGGER.info("Update participant {}", participantId);

    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    Participant existingParticipant = participantRepository.findByIdAndAdminId(participantId, adminId);
    validatorService.checkEntityNotNull(existingParticipant, "Could not load participant " + participantId + " for dinner " + adminId);
    
    checkNoOtherParticipantHasEmail(existingParticipant, incomingParticipant.getEmail());

    mapParticipantInputToParticipant(incomingParticipant, existingParticipant, runningDinner, false);

    Participant result = participantRepository.save(existingParticipant);

    if (incomingParticipant.isTeamPartnerWishRegistrationDataProvided()) {
      result = handleTeamPartnerWishRegistrationData(result, incomingParticipant.getTeamPartnerWishRegistrationData());
    }
    
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
  public Participant addParticipant(@ValidateAdminId String adminId, ParticipantInputDataTO incomingParticipant) {

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
  public Participant addParticipant(RunningDinner runningDinner, ParticipantInputDataTO incomingParticipant, boolean participantSubscription) {

    checkDuplicatedRegistration(runningDinner.getAdminId(), incomingParticipant.getEmail());
    
    Participant participant = mapParticipantInputToParticipant(incomingParticipant, new Participant(), runningDinner, true); 

    setParticipantNumberAndRunningDinner(participant, runningDinner);
    
    if (!participantSubscription) {
      participant.setActivatedBy(runningDinner.getEmail());
      participant.setActivationDate(LocalDateTime.now());
    }
      
    Participant createdParticipant = participantRepository.save(participant);
    
    if (incomingParticipant.isTeamPartnerWishRegistrationDataProvided()) {
      createdParticipant = handleTeamPartnerWishRegistrationData(createdParticipant, incomingParticipant.getTeamPartnerWishRegistrationData());
    }

    putGeocodeEventToQueue(createdParticipant, runningDinner);

    return createdParticipant;
  }

  public Participant mapParticipantInputToParticipant(ParticipantInputDataTO incomingParticipantData,
                                                      Participant dest,
                                                      RunningDinner runningDinner, 
                                                      boolean checkForDuplicatedEmail) {
    
    if (checkForDuplicatedEmail) {
      checkDuplicatedRegistration(runningDinner.getAdminId(), incomingParticipantData.getEmail());
    }
    
    Assert.state(!(incomingParticipantData.isTeamPartnerWishInvitationEmailAddressProvided() && incomingParticipantData.isTeamPartnerWishRegistrationDataProvided()), 
        "Both teamPartnerWishInvitationEmailAddress and teamPartnerWishRegistrationData is provided by client, only one is allowed!");
    
    copyFields(incomingParticipantData, dest);
    
    if (incomingParticipantData.isTeamPartnerWishRegistrationDataProvided()) {
      if (runningDinner.getConfiguration().canHost(dest) != FuzzyBoolean.TRUE) {
        throw new ValidationException(new IssueList(new Issue("numSeats", IssueKeys.NUM_SEATS_TEAMPARTNER_REGISTRATION_INVALID, IssueType.VALIDATION)));
      }
    }
    
    if (incomingParticipantData.isTeamPartnerWishInvitationEmailAddressProvided()) {
      TeamPartnerWishStateHandlerService.checkEmailDoesNotEqualTeamPartnerWish(dest);
    }
    
    return dest;
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
    handleTeamPartnerWishRegistrationSubscription(runningDinner, result);
    
    teamPartnerWishStateHandlerService.handleTeamPartnerWishForSubscribedParticipant(result, runningDinner);
   
    return result;
  }

  private void handleTeamPartnerWishRegistrationSubscription(RunningDinner runningDinner, Participant activatedParticipant) {
    if (activatedParticipant.isTeamPartnerWishRegistratonRoot()) {
      Participant autoRegisteredTeamPartnerWish = findChildParticipantOfTeamPartnerRegistration(runningDinner.getAdminId(), activatedParticipant); 
      if (autoRegisteredTeamPartnerWish == null) {
        LOGGER.warn("It seems like that auto-registered team partner wish with id {} of {} is not existing any longer in this dinner, which can occur in rare cases", 
                     activatedParticipant.getTeamPartnerWishOriginatorId(), activatedParticipant);    
        return;
      }
      autoRegisteredTeamPartnerWish.setActivatedBy(activatedParticipant.getActivatedBy());
      autoRegisteredTeamPartnerWish.setActivationDate(activatedParticipant.getActivationDate());
      participantRepository.save(autoRegisteredTeamPartnerWish);
    }
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

  protected void copyFields(ParticipantInputDataTO incomingParticipant, Participant dest) {

    dest.setGender(incomingParticipant.getGender());

    dest.setEmail(incomingParticipant.getEmail());

    dest.setNumSeats(incomingParticipant.getNumSeats());

    ParticipantName participantName = ParticipantName.newName()
        .withFirstname(incomingParticipant.getFirstnamePart())
        .andLastname(incomingParticipant.getLastname());
    dest.setName(participantName);
    
    ParticipantAddress address = new ParticipantAddress();
    address.setZip(incomingParticipant.getZip());
    address.setStreet(incomingParticipant.getStreet());
    address.setStreetNr(incomingParticipant.getStreetNr());
    address.setCityName(incomingParticipant.getCityName());
    address.setRemarks(incomingParticipant.getAddressRemarks());
    address.setAddressName(incomingParticipant.getAddressName());
    dest.setAddress(address);

    dest.setAge(incomingParticipant.getAgeNormalized());
    dest.setMobileNumber(incomingParticipant.getMobileNumber());

    dest.setMealSpecifics(incomingParticipant.getMealSpecifics());
    dest.setNotes(incomingParticipant.getNotes());
    
    dest.setTeamPartnerWishEmail(incomingParticipant.getTeamPartnerWishEmail());
  }

  public List<Participant> findParticipantByEmail(String adminId, String email) {

    if (StringUtils.isEmpty(email)) {
      return Collections.emptyList();
    }
    String normalizedEmail = email.trim();
    return participantRepository.findByEmailIgnoreCaseAndAdminIdOrderByParticipantNumber(normalizedEmail, adminId);
  }

  protected void checkDuplicatedRegistration(String dinnerAdminId, String email) {

    List<Participant> existingParticipants = findParticipantByEmail(dinnerAdminId, email);
    if (CollectionUtils.isNotEmpty(existingParticipants)) {
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
    
    if (participant.getTeamPartnerWishOriginatorId() != null) {
      if (participant.isTeamPartnerWishRegistratonRoot()) {
        Participant childParticipant = findChildParticipantOfTeamPartnerRegistration(adminId, participant);
        participantRepository.delete(childParticipant);
      } else {
        clearTeamPartnerWishOriginatorOfRootParticipant(adminId, participant.getTeamPartnerWishOriginatorId());
      }
    }

    participantRepository.delete(participant);
  }
  
  @Transactional
  public Participant clearTeamPartnerWishOriginatorOfRootParticipant(@ValidateAdminId String adminId, UUID rootParticipantId) {
    
    Participant participant = participantRepository.findByIdAndAdminId(rootParticipantId, adminId);
    Assert.notNull(participant, "Participant not found for " + rootParticipantId + " in event " + adminId);
    Assert.state(participant.isTeamPartnerWishRegistratonRoot(), "clearTeamPartnerWishOriginatorId only allowed for root participant, but " + participant + " was not");
    participant.setTeamPartnerWishOriginatorId(null);
    return participantRepository.save(participant);
  }
  
  public Participant findChildParticipantOfTeamPartnerRegistration(@ValidateAdminId String adminId, Participant participant) {
    
    Assert.state(participant.isTeamPartnerWishRegistratonRoot(), 
                 "findChildParticipantOfTeamPartnerRegistration can only be called for participant that is root participant, but " + participant + " was not.");

    return participantRepository.findByTeamPartnerWishOriginatorIdAndIdNotAndAdminId(participant.getTeamPartnerWishOriginatorId(), participant.getId(), adminId);
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
  
  public static List<Participant> filterParticipantsAssignedIntoTeams(List<Participant> participants) {
  	
    return participants
    				.stream()
    				.filter(p -> p.getTeamId() != null)
    				.collect(Collectors.toList());
  }
  

  public static List<Participant> filterParticipantsWithTeamPartnerRegistration(List<Participant> participants) {

    return participants
            .stream()
            .filter(p -> p.getTeamPartnerWishOriginatorId() != null)
            .collect(Collectors.toList());
  }
  
  public static boolean hasConsistentTeamPartnerWishRegistration(List<Participant> participants) {
    if (CollectionUtils.isEmpty(participants) || participants.size() == 1) {
      return true;
    }
    List<UUID> teamPartnerWishOriginatorIds = new ArrayList<>(1);
    for (Participant p : participants) {
      if (p.getTeamPartnerWishOriginatorId() == null) {
        continue;
      }
      teamPartnerWishOriginatorIds.add(p.getTeamPartnerWishOriginatorId());
    }
    if (CollectionUtils.isEmpty(teamPartnerWishOriginatorIds)) {
      return true;
    }

    Set<UUID> uniqueTeamPartnerWishOriginatorIds = new HashSet<>(teamPartnerWishOriginatorIds);
    return uniqueTeamPartnerWishOriginatorIds.size() == 1 && teamPartnerWishOriginatorIds.size() == participants.size();
  }
  
  private void checkNoOtherParticipantHasEmail(Participant participant, String newEmailAddress) {

    List<Participant> participants = participantRepository.findByEmailIgnoreCaseAndIdNotAndAdminId(newEmailAddress, participant.getId(), participant.getAdminId());
    if (CollectionUtils.isEmpty(participants)) {
      return;
    }
    if (participants.size() > 1) {
      throw new ValidationException(new IssueList(new Issue("email", IssueKeys.PARTICIPANT_ALREADY_REGISTERED, IssueType.VALIDATION))); 
    }
    Participant participantWithSameEmail = participants.get(0);
    if (!participant.isTeamPartnerWishRegistrationChildOf(participantWithSameEmail)) {
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
  
  private static List<ParticipantWithListNumberTO> applyListNumbers(List<Participant> participants, int startNumber) {
  	
  	List<ParticipantWithListNumberTO> result = new ArrayList<>(participants.size());
  	int listNumber = startNumber;
    for (Participant p : participants) {
      result.add(new ParticipantWithListNumberTO(p, listNumber++));
    }
    return result;
  }
  
  
  private void setParticipantNumberAndRunningDinner(Participant participant, RunningDinner runningDinner) {
    
    int participantNumber = getNextParticipantNumber(runningDinner);
    participant.setParticipantNumber(participantNumber);
    participant.setRunningDinner(runningDinner);    
  }
  
  private Participant handleTeamPartnerWishRegistrationData(Participant participant,
                                                            TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData) {

    if (participant.isTeamPartnerWishRegistratonRoot()) {
      // update case (with already provided registration data on creation before) -> Do nothing (team partner wish participant needs to be updated for itself)
      return participant;
    }
    
    String firstnamePart = teamPartnerWishRegistrationData.getFirstnamePart();
    String lastname = teamPartnerWishRegistrationData.getLastname();
    
    Participant teamPartnerWish = participant.createDetachedClone();
    teamPartnerWish.setHost(false); // Not needed, but just to be sure
    
    teamPartnerWish.setName(ParticipantName.newName().withFirstname(firstnamePart).andLastname(lastname));
    
    teamPartnerWish.setAge(Participant.UNDEFINED_AGE);
    teamPartnerWish.setNumSeats(0);
    teamPartnerWish.setGender(Gender.UNDEFINED);
    
    setParticipantNumberAndRunningDinner(teamPartnerWish, participant.getRunningDinner());
    
    teamPartnerWish.setTeamPartnerWishOriginatorId(participant.getId());
    participant.setTeamPartnerWishOriginatorId(participant.getId());
    
    participantRepository.save(teamPartnerWish);
    return participantRepository.save(participant);
  }


}
