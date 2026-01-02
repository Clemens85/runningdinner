
package org.runningdinner.participant;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.AssignableParticipantSizes;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.Gender;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.converter.ConverterFactory;
import org.runningdinner.core.converter.ConverterFactory.INPUT_FILE_TYPE;
import org.runningdinner.core.converter.ConverterWriteContext;
import org.runningdinner.core.converter.FileConverter;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.request.GeocodeRequestEventPublisher;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

import java.io.IOException;
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

@Service
public class ParticipantService {


  private static final Logger LOGGER = LoggerFactory.getLogger(ParticipantService.class);

  @Autowired
  private ParticipantRepository participantRepository;

  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private ValidatorService validatorService;
  
  @Autowired
  private TeamPartnerWishStateHandlerService teamPartnerWishStateHandlerService;

  @Autowired
  private GeocodeRequestEventPublisher geocodeRequestEventPublisher;
  
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
      missingParticipantsInfo = MissingParticipantsInfo.newMissingParticipantsInfo(minimumParticipantsNeeded,
          Math.max(numParticipantsMissing, 0));
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
   * @param adminId adminId of dinner
   * @param participantId id of participant to be updated
   * @param incomingParticipant data to be updated
   */
  @Transactional
  public Participant updateParticipant(@ValidateAdminId String adminId, UUID participantId, final ParticipantInputDataTO incomingParticipant) {

    LOGGER.info("Update participant {}", participantId);

    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    Participant existingParticipant = participantRepository.findByIdAndAdminId(participantId, adminId);
    validatorService.checkEntityNotNull(existingParticipant, "Could not load participant " + participantId + " for dinner " + adminId);
    
    checkNoOtherParticipantHasEmail(existingParticipant, incomingParticipant.getEmail());

    var syncSettings = SyncSettings.allWithOriginalData(existingParticipant.getEmail(), existingParticipant.getMobileNumber());

    mapParticipantInputToParticipant(incomingParticipant, existingParticipant, runningDinner, false);
    Participant result = participantRepository.save(existingParticipant);

    syncChangesToChildParticipant(adminId, result, syncSettings);

    putGeocodeEventToQueue(result);

    return result;
  }

  private void syncChangesToChildParticipant(String adminId, Participant updatedParticipant, SyncSettings syncSettings) {
    if (!updatedParticipant.isTeamPartnerWishRegistratonRoot()) {
      return;
    }

    Participant childParticipant = findChildParticipantOfTeamPartnerRegistration(adminId, updatedParticipant);
    childParticipant.setGeocodingResult(new GeocodingResult(updatedParticipant.getGeocodingResult()));
    if (!syncSettings.isSyncOnlyGeocodeData()) {
      childParticipant.setAddress(updatedParticipant.getAddress().createDetachedClone());
      childParticipant.setMealSpecifics(updatedParticipant.getMealSpecifics().createDetachedClone());
      childParticipant.setNotes(updatedParticipant.getNotes());

      // If child participant has same email as the parent participant before update,
      // then we sync this (maybe) changed email from parent participant.
      // If the child participant had already a different email, then we won't sync, in order to keep it's own email
      if (syncSettings.hasSameOriginalEmail(childParticipant.getEmail())) {
        childParticipant.setEmail(updatedParticipant.getEmail());
      }
      if (syncSettings.hasSameOriginalMobileNumber(childParticipant.getMobileNumber())) {
        childParticipant.setMobileNumber(updatedParticipant.getMobileNumber());
      }
    }

    participantRepository.save(childParticipant);
  }

  @Transactional
  public Participant updateParticipantGeocode(String adminId, UUID participantId, GeocodingResult incomingGeocodingResult) {

    LOGGER.info("Update geocode of participant {}", participantId);

    Participant existingParticipant = participantRepository.findByIdAndAdminId(participantId, adminId);
    if (existingParticipant == null) {
    	LOGGER.warn("Could not load participant {} for dinner {}. This may happen if the participant was deleted.", participantId, adminId);
    	return null;
    }

    existingParticipant.setGeocodingResult(incomingGeocodingResult);
    var result = participantRepository.save(existingParticipant);
    syncChangesToChildParticipant(adminId, result, SyncSettings.onlyGeocodeData());
    return result;
  }

  /**
   * Adds a new participant to the running dinner identified by dinner admin id
   *
   */
  @Transactional
  public Participant addParticipant(@ValidateAdminId String adminId, ParticipantInputDataTO incomingParticipant) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    return addParticipant(runningDinner, incomingParticipant, false);
  }

  /**
   * Adds a new participant to the passed running dinner
   *
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
      
    // Only relevant for import scenarios where we might have valid geocoding
    if (GeocodingResult.isValid(incomingParticipant.getGeocodingResult())) {
    	participant.setGeocodingResult(incomingParticipant.getGeocodingResult());
    }
    
    Participant createdParticipant = participantRepository.save(participant);
    
    if (incomingParticipant.isTeamPartnerWishRegistrationDataProvided()) {
      createdParticipant = handleTeamPartnerWishRegistrationData(createdParticipant, incomingParticipant.getTeamPartnerWishRegistrationData());
    }

    // Only perform geocoding if not already provided (-> import scenarios)
    if (!GeocodingResult.isValid(incomingParticipant.getGeocodingResult())) {
      putGeocodeEventToQueue(createdParticipant);
    }

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
    
    copyFieldsFromInputToParticipant(incomingParticipantData, dest);
    
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

    if (existingParticipant.getActivationDate() != null) {
      LOGGER.info("Participant {} was already activated", existingParticipant);
      return existingParticipant;
    }

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

  public static void copyFieldsFromInputToParticipant(ParticipantInputDataTO incomingParticipant, Participant dest) {

    ParticipantName participantName = ParticipantName.newName()
      .withFirstname(incomingParticipant.getFirstnamePart())
      .andLastname(incomingParticipant.getLastname());

    dest.setName(participantName);
    dest.setEmail(incomingParticipant.getEmail());
    dest.setMobileNumber(incomingParticipant.getMobileNumber());

    if (dest.isTeamPartnerWishRegistratonChild()) {
      // Children have currently only basic contact data to be managed (all other fields are not used and/or are owned by root participant
      return;
    }

    dest.setGender(incomingParticipant.getGender());

    dest.setNumSeats(incomingParticipant.getNumSeats());

    ParticipantAddress address = new ParticipantAddress();
    address.setZip(incomingParticipant.getZip());
    address.setStreet(incomingParticipant.getStreet());
    address.setStreetNr(incomingParticipant.getStreetNr());
    address.setCityName(incomingParticipant.getCityName());
    address.setRemarks(incomingParticipant.getAddressRemarks());
    address.setAddressName(incomingParticipant.getAddressName());
    dest.setAddress(address);

    dest.setAge(incomingParticipant.getAgeNormalized());

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
  
  public static void removeTeamPartnerWishOriginatorIds(Collection<Participant> participants) {
    for (Participant participant : participants) {
      participant.setTeamPartnerWishOriginatorId(null);
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

  public static List<ParticipantWithListNumberTO> mapToRawList(ParticipantListActive participantList) {
    List<ParticipantWithListNumberTO> participants = participantList.getParticipants();
    List<ParticipantWithListNumberTO> waitingList = participantList.getParticipantsWaitingList();
    List<ParticipantWithListNumberTO> result = new ArrayList<>(participants);
    result.addAll(waitingList);
    return result;
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
    Participant participantWithSameEmail = participants.getFirst();
    if (!participant.isTeamPartnerWishRegistrationChildOf(participantWithSameEmail)) {
      throw new ValidationException(new IssueList(new Issue("email", IssueKeys.PARTICIPANT_ALREADY_REGISTERED, IssueType.VALIDATION)));
    }
  }
  
  private static void checkActivationValidForDinner(RunningDinner runningDinner) {

    if (runningDinner.getRunningDinnerType() == RunningDinnerType.DEMO) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.PARTICIPANT_ACTIVATION_INVALID_DEMO_DINNER, IssueType.VALIDATION)));
    }
  }

  private void putGeocodeEventToQueue(final Participant participant) {
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void afterCompletion(int status) {
        if (status != TransactionSynchronization.STATUS_COMMITTED) {
          return;
        }
        try {
        	geocodeRequestEventPublisher.sendParticipantGeocodingRequestAsync(participant);
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
    String email = teamPartnerWishRegistrationData.getEmail();
    String mobileNumber = teamPartnerWishRegistrationData.getMobileNumber();

    Participant teamPartnerWish = participant.createDetachedClone(false);
    teamPartnerWish.setHost(false); // Not needed, but just to be sure
    
    teamPartnerWish.setName(ParticipantName.newName().withFirstname(StringUtils.trim(firstnamePart)).andLastname(StringUtils.trim(lastname)));
    
    teamPartnerWish.setAge(Participant.UNDEFINED_AGE);
    teamPartnerWish.setNumSeats(0);
    teamPartnerWish.setGender(Gender.UNDEFINED);

    if (StringUtils.isNotBlank(email)) {
      teamPartnerWish.setEmail(email.trim());
    }
    if (StringUtils.isNotBlank(mobileNumber)) {
      teamPartnerWish.setMobileNumber(mobileNumber.trim());
    }
    
    setParticipantNumberAndRunningDinner(teamPartnerWish, participant.getRunningDinner());
    
    teamPartnerWish.setTeamPartnerWishOriginatorId(participant.getId());
    participant.setTeamPartnerWishOriginatorId(participant.getId());
    
    participantRepository.save(teamPartnerWish);
    return participantRepository.save(participant);
  }

  public static class SyncSettings {

    private final String originalEmail;

    private final String originalMobileNumber;

    private final boolean syncOnlyGeocodeData;

    private SyncSettings(String originalEmail, String originalMobileNumber, boolean syncOnlyGeocodeData) {
      this.originalEmail = originalEmail;
      this.originalMobileNumber = originalMobileNumber;
      this.syncOnlyGeocodeData = syncOnlyGeocodeData;
    }

    public static SyncSettings onlyGeocodeData() {
      return new SyncSettings(null, null, true);
    }

    public static SyncSettings allWithOriginalData(String originalEmail, String originalMobileNumber) {
      return new SyncSettings(originalEmail, originalMobileNumber, false);
    }

    public boolean hasSameOriginalEmail(String email) {
      if (StringUtils.isBlank(email)) {
        return false;
      }
      return StringUtils.equalsIgnoreCase(StringUtils.trim(email), StringUtils.trim(originalEmail));
    }

    public boolean hasSameOriginalMobileNumber(String mobileNumber) {
      if (StringUtils.isBlank(mobileNumber)) {
        return false;
      }
      return StringUtils.equalsIgnoreCase(StringUtils.trim(mobileNumber), StringUtils.trim(originalMobileNumber));
    }

    public boolean isSyncOnlyGeocodeData() {
      return syncOnlyGeocodeData;
    }
  }
}
