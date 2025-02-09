
package org.runningdinner.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.admin.rest.BasicSettingsTO;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.IdGenerator;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.*;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.event.RunningDinnerSettingsUpdatedEvent;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.masterdata.MasterDataService;
import org.runningdinner.wizard.BasicDetailsTO;
import org.runningdinner.wizard.PublicSettingsTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

@Service
public class RunningDinnerService implements ApplicationContextAware {

  private static Logger LOGGER = LoggerFactory.getLogger(RunningDinnerService.class);

  @Autowired
  private RunningDinnerRepository runningDinnerRepository;

  @Autowired
  private RunningDinnerPreferencesRepository runningDinnerPreferencesRepository;

  @Autowired
  private MealRepository mealRepository;

  @Autowired
  private IdGenerator idGenerator;

  @Autowired
  private EventPublisher eventPublisher;

  @Autowired
  private ValidatorService validatorService;

  @Autowired
  private MasterDataService masterDataService;
  
  @Autowired
  private UrlGenerator urlGenerator;

  private ApplicationContext applicationContext;

  public RunningDinner findRunningDinnerByAdminId(@ValidateAdminId String adminId) {

    RunningDinner runningDinner = runningDinnerRepository.findByAdminId(adminId);
    validatorService.checkRunningDinnerNotNull(runningDinner);
    return urlGenerator.addPublicDinnerUrl(runningDinner);
  }

  public RunningDinner findRunningDinnerBySelfAdministrationId(UUID selfAdministrationId) {

    RunningDinner runningDinner = runningDinnerRepository.findBySelfAdministrationId(selfAdministrationId);
    validatorService.checkRunningDinnerNotNull(runningDinner);
    return urlGenerator.addPublicDinnerUrl(runningDinner);
  }
  
  /**
   * Creates a new persistent running dinner instance
   * 
   * @param runningDinnerInfo Basic detail infos about the running dinner to create
   * @param runningDinnerConfig The options of the running dinner
   * @param email
   * @param runningDinnerType
   * @return
   */
  @Transactional
  public RunningDinner createRunningDinner(RunningDinnerInfo runningDinnerInfo, RunningDinnerConfig runningDinnerConfig, String email, 
                                           RunningDinnerType runningDinnerType, AfterPartyLocation afterPartyLocation) {

    return createRunningDinner(runningDinnerInfo, runningDinnerConfig, null, email, runningDinnerType, afterPartyLocation);
  }

  @Transactional
  public RunningDinner createRunningDinner(RunningDinnerInfo runningDinnerInfo, 
                                           RunningDinnerConfig runningDinnerConfig, 
                                           PublicSettings publicSettings, 
                                           String email, 
                                           RunningDinnerType runningDinnerType,
                                           AfterPartyLocation afterPartyLocation) {

    return createRunningDinnerInternal(runningDinnerInfo, runningDinnerConfig, publicSettings, email, runningDinnerType, afterPartyLocation);
  }

  protected RunningDinner createRunningDinnerInternal(RunningDinnerInfo runningDinnerInfo, 
                                                      RunningDinnerConfig runningDinnerConfig, 
                                                      PublicSettings publicSettings, 
                                                      String email, 
                                                      RunningDinnerType runningDinnerType,
                                                      AfterPartyLocation afterPartyLocation) {

    String adminId = idGenerator.generateAdminId();

    RunningDinner result = new RunningDinner();
    
    copyBasicDetails(runningDinnerInfo, result);
    
    result.setRunningDinnerType(runningDinnerType);
    
    result.setEmail(email);

    List<MealClass> incomingMealClasses = runningDinnerConfig.getMealClasses();
    List<MealClass> mealClasses = incomingMealClasses.stream().map(m -> new MealClass(m.getLabel(), m.getTime())).collect(
      Collectors.toList());
    LOGGER.info("Saving {} meals for running dinner {}", mealClasses.size(), adminId);
    runningDinnerConfig.setMealClasses(mealRepository.saveAll(mealClasses));

    result.setConfiguration(runningDinnerConfig);
    result.setAdminId(adminId);
    
    result.setSelfAdministrationId(UUID.randomUUID());

    if (result.getRegistrationType() != RegistrationType.CLOSED) {
      result.setPublicSettings(publicSettings);
      generatePublicIdIfNotExisting(result.getPublicSettings());
    } 
    
    LOGGER.info("Saving complete running dinner {}", adminId);
    result = runningDinnerRepository.save(result);
    
    if (afterPartyLocation != null) {
      result.setAfterPartyLocation(afterPartyLocation);
    }

    emitNewRunningDinnerEvent(result);

    return result;
  }

  private static void copyBasicDetails(RunningDinnerInfo src, RunningDinner dest) {
    dest.setCity(src.getCity());
    dest.setZip(src.getZip());
    dest.setTitle(src.getTitle());
    dest.setDate(src.getDate());
    dest.setRegistrationType(src.getRegistrationType());
    dest.setLanguageCode(src.getLanguageCode());
    dest.setZipRestrictions(src.getZipRestrictions());
  }

  @Transactional
  public RunningDinner cancelRunningDinner(@ValidateAdminId String adminId, LocalDateTime cancellationDate) {

    RunningDinner result = findRunningDinnerByAdminId(adminId);
    
    if (result.isCancelled()) {
      return result;
    }
    
    result.setCancellationDate(cancellationDate);
    result = runningDinnerRepository.save(result);
    
    emitRunningDinnerCancelledEvent(result);
    
    return result;
  }
  
  @Transactional
  public RunningDinner acknowledgeRunningDinner(@ValidateAdminId String adminId, UUID acknowledgeId, LocalDateTime acknowledgedDate) {
    
    RunningDinner result = findRunningDinnerByAdminId(adminId);
    if (result.isAcknowledged()) {
      return result;
    }

    // We "abuse" the objectId for this stuff... the objectId is never sent outside in the rest layer... if so, we must change this logic
    Assert.state(result.getObjectId().equals(acknowledgeId), "Incoming id to acknowledge is not valid!");
    
    result.setAcknowledgedDate(acknowledgedDate);
    result = runningDinnerRepository.save(result);
    
    return result;
  }
  
  public List<RunningDinner> findRunningDinnersCancelledBefore(LocalDateTime date) {

    List<RunningDinner> result = runningDinnerRepository.findByCancellationDateLessThanEqual(date);
    return urlGenerator.addPublicDinnerUrl(result);
  }

  @Transactional
  public RunningDinner updateMealTimes(@ValidateAdminId String adminId, Collection<MealClass> incomingMeals) {

    RunningDinner dinner = findRunningDinnerByAdminId(adminId);
    List<MealClass> existingMeals = dinner.getConfiguration().getMealClasses();

    LOGGER.info("Update {} meal-times for dinner {}", existingMeals.size(), adminId);

    // It's not allowed to add or remove meals (just update the existing ones):
    Assert.state(existingMeals.size() == incomingMeals.size(), "Expected " + incomingMeals.size() + " meals to be found, but there were  " + existingMeals.size());

    for (MealClass incomingMeal : incomingMeals) {

      Optional<MealClass> existingMealOptional = existingMeals.stream().filter(m -> m.isSameId(incomingMeal.getId())).findFirst();
      MealClass existingMeal = existingMealOptional.orElseThrow(() -> new EntityNotFoundException(incomingMeal.getId() + " could not be found!"));
      
      existingMeal.setTime(incomingMeal.getTime());
    }

    // TODO Maybe add validation for times not being set to other days.
    
    // Ensure that ordering is still correct
    existingMeals.sort(new MealClassSorter());
    dinner.getConfiguration().setMealClasses(existingMeals);

    emitUpdateMealTimesEvent(dinner);

    return dinner;
  }
  
  @Transactional
  public RunningDinner updateRunningDinnerAdminEmail(@ValidateAdminId String adminId, String newAdminEmail) {
  	
  	RunningDinner runningDinner = findRunningDinnerByAdminId(adminId);
  	Assert.hasText(newAdminEmail, "Expected incoming newAdminEmail to be not empty for dinner " + adminId);
  	boolean publicContactMailUpdateNeeded = runningDinner.getPublicSettings() != null && 
  	                                        StringUtils.equalsIgnoreCase(runningDinner.getPublicSettings().getPublicContactEmail(), runningDinner.getEmail());
  	runningDinner.setEmail(newAdminEmail);
  	if (publicContactMailUpdateNeeded) {
  	  runningDinner.getPublicSettings().setPublicContactEmail(newAdminEmail);
  	}
  	return runningDinnerRepository.save(runningDinner);
  }
  
  @Transactional
  public RunningDinner updateBasicSettings(@ValidateAdminId String adminId, BasicSettingsTO basicSettings) {

    BasicDetailsTO basicDetails = basicSettings.getBasicDetails();
    
    validateRunningDinnerDate(basicDetails.getDate());
    
    RunningDinner dinnerToUpdate = findRunningDinnerByAdminId(adminId);
    RunningDinnerInfo basicDetailsUnmodified = dinnerToUpdate.createDetachedCloneRunningDinnerInfo();
    
    RegistrationType unmodifiedRegistrationType = dinnerToUpdate.getRegistrationType();
    LocalDate unmodifiedDinnerDate = dinnerToUpdate.getDate();
    
    copyBasicDetails(basicDetails, dinnerToUpdate);
    
    handleChangedRegistrationType(dinnerToUpdate, unmodifiedRegistrationType);
    handleChangedDinnerDate(dinnerToUpdate, unmodifiedDinnerDate);
    
    dinnerToUpdate.getConfiguration().setTeamPartnerWishDisabled(basicSettings.isTeamPartnerWishDisabled());
    
    RunningDinner result = saveRunningDinner(dinnerToUpdate); 
            
    emitRunningDinnerSettingsUpdatedEvent(new RunningDinnerSettingsUpdatedEvent(this, result, basicDetailsUnmodified));
    
    return result;
  }
  
  @Transactional
  public RunningDinner updatePublicSettings(@ValidateAdminId String adminId, PublicSettingsTO publicSettings) {

    RunningDinner dinnerToUpdate = findRunningDinnerByAdminId(adminId);
    PublicSettings publicSettingsUnmodified = dinnerToUpdate.getPublicSettings().createDetachedClone();
    
    validatePublicSettings(publicSettings, dinnerToUpdate.getDate());
    
    PublicSettings publicSettingsToUpdate = dinnerToUpdate.getPublicSettings();
    publicSettingsToUpdate.setEndOfRegistrationDate(publicSettings.getEndOfRegistrationDate());
    publicSettingsToUpdate.setPublicDescription(publicSettings.getDescription());
    publicSettingsToUpdate.setPublicTitle(publicSettings.getTitle());
    publicSettingsToUpdate.setPublicContactEmail(publicSettings.getPublicContactEmail());
    publicSettingsToUpdate.setPublicContactMobileNumber(publicSettings.getPublicContactMobileNumber());
    publicSettingsToUpdate.setPublicContactName(publicSettings.getPublicContactName());
    
    RunningDinner result = saveRunningDinner(dinnerToUpdate); 
            
    emitRunningDinnerSettingsUpdatedEvent(new RunningDinnerSettingsUpdatedEvent(this, result, publicSettingsUnmodified));
    
    return result;
  }
  
  @Transactional
  public RunningDinner updateRegistrationActiveState(@ValidateAdminId String adminId, boolean enable) {

    RunningDinner dinnerToUpdate = findRunningDinnerByAdminId(adminId);
    Assert.state(!dinnerToUpdate.getRegistrationType().isClosed(), "Can only activate/deactivate registration for non-closed events: " + dinnerToUpdate);
    
    PublicSettings publicSettingsUnmodified = dinnerToUpdate.getPublicSettings().createDetachedClone();
    
    dinnerToUpdate.getPublicSettings().setRegistrationDeactivated(!enable);
    RunningDinner result = saveRunningDinner(dinnerToUpdate); 
    
    emitRunningDinnerSettingsUpdatedEvent(new RunningDinnerSettingsUpdatedEvent(this, result, publicSettingsUnmodified));
    
    return result;
  }
  
  public static void validatePublicSettings(PublicSettingsTO publicSettings, LocalDate runningDinnerDate) {

    LocalDate endOfRegistrationDate = publicSettings.getEndOfRegistrationDate();
    if (runningDinnerDate.isBefore(endOfRegistrationDate)) {
      throw new ValidationException(new IssueList(new Issue("endOfRegistrationDate", "error.endOfRegistrationDate.invalid",
        IssueType.VALIDATION)));
    }
  }
  
  public static void validateRunningDinnerDate(LocalDate runningDinnerDate) {
    LocalDate now = LocalDate.now();
    if (runningDinnerDate.isBefore(now)) {
      throw new ValidationException(new IssueList(new Issue("date", "error_date_invalid", IssueType.VALIDATION)));
    }
  }

  public static void validateZipRestrictions(String zipRestrictions) {
    var result = ZipRestrictionCalculator.calculateResultingZipRestrictions(zipRestrictions);
    if (CollectionUtils.isNotEmpty(result.getInvalidZips())) {
      throw new ValidationException(new IssueList(new Issue("zipRestrictions", "error.zipRestrictions.invalid", IssueType.VALIDATION)));
    }
  }
  
  private void handleChangedDinnerDate(RunningDinner dinnerToUpdate, LocalDate unmodifiedDinnerDate) {

    if (dinnerToUpdate.getDate().isEqual(unmodifiedDinnerDate)) {
      return;
    }
    
    List<MealClass> meals = dinnerToUpdate.getConfiguration().getMealClasses();
    for (MealClass meal : meals) {
      LocalDateTime mealTime = meal.getTime();
      mealTime = mealTime.with(dinnerToUpdate.getDate());
      meal.setTime(mealTime);
    }
    
    List<MealClass> updatedMeals = mealRepository.saveAll(meals);
    dinnerToUpdate.getConfiguration().setMealClasses(updatedMeals);
  }

  private void handleChangedRegistrationType(RunningDinner dinnerToUpdate, RegistrationType unmodifiedRegistrationType) {
    
    RegistrationType updatedRegistrationType = dinnerToUpdate.getRegistrationType();
    
    if (unmodifiedRegistrationType.isChangedFromClosedToPublicOrOpen(updatedRegistrationType)) {
      PublicSettings publicSettings = dinnerToUpdate.getPublicSettings();
      generatePublicIdIfNotExisting(publicSettings);
      if (publicSettings.getEndOfRegistrationDate() == null) {
        LocalDate dinnerDate = dinnerToUpdate.getDate();
        LocalDate endOfRegistrationDateProposal = dinnerDate.minusDays(7);
        LocalDate now = LocalDate.now();
        if (endOfRegistrationDateProposal.isBefore(now)) {
          endOfRegistrationDateProposal = DateTimeUtil.min(now, dinnerDate);
        }
        publicSettings.setEndOfRegistrationDate(endOfRegistrationDateProposal);
      }
      if (StringUtils.isEmpty(publicSettings.getPublicTitle())) {
        publicSettings.setPublicTitle(dinnerToUpdate.getTitle());
      }
      dinnerToUpdate.setPublicSettings(publicSettings);
    }
    
  }

  public RunningDinnerPreferences getPreferences(final String adminId) {

    RunningDinner runningDinner = findRunningDinnerByAdminId(adminId);

    List<RunningDinnerPreference> preferences = runningDinnerPreferencesRepository.findByAdminIdOrderByPreferenceNameAsc(adminId);
    // Not nice, but by doing so we achieve prototype-scope for this bean within the service (singleton) bean:
    RunningDinnerPreferences result = applicationContext.getBean("runningDinnerPreferences", RunningDinnerPreferences.class);
    result.init(runningDinner, preferences);
    return result;
  }

  public RunningDinnerSessionData findSessionData(String dinnerAdminId, Locale locale) {

    RunningDinner runningDinner = findRunningDinnerByAdminId(dinnerAdminId);
    return calculateSessionData(runningDinner, locale);
  }
  
  public RunningDinnerSessionData calculateSessionData(RunningDinner runningDinner, Locale locale) {
    
    RunningDinnerSessionData result = new RunningDinnerSessionData();
    result.setAssignableParticipantSizes(AssignableParticipantSizes.create(runningDinner.getConfiguration()));

    int numSeatsNeededForHost = runningDinner.getConfiguration().getNumberOfMealClasses() * runningDinner.getConfiguration().getTeamSize();
    result.setNumSeatsNeededForHost(numSeatsNeededForHost);

    result.setGenderAspects(masterDataService.findGenderAspects(locale));
    result.setGenders(masterDataService.findGenders(locale));
    result.setRegistrationTypes(masterDataService.findRegistrationTypes(locale));

    return result;
  }
  
  public List<RunningDinner> findRunningDinnersWithDateBefore(LocalDate date) {

    List<RunningDinner> result = runningDinnerRepository.findByDateBefore(date);
    return urlGenerator.addPublicDinnerUrl(result);
  }

  /**
   * Generate a new UUID which can e.g. be used for a new running dinner administration
   * 
   * @return
   */
  public String generateNewAdminId() {

    return idGenerator.generateAdminId();
  }

  
  protected RunningDinner saveRunningDinner(RunningDinner dinnerToUpdate) {
    
    RunningDinner result = runningDinnerRepository.save(dinnerToUpdate);
    return urlGenerator.addPublicDinnerUrl(result);
  }
  
  protected void checkRunningDinnerExists(final String adminId) {

    RunningDinner runningDinner = runningDinnerRepository.findByAdminId(adminId);
    validatorService.checkRunningDinnerNotNull(runningDinner);
  }
  

  private void emitUpdateMealTimesEvent(RunningDinner dinner) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyMealTimesUpdated(dinner);
      }
    });
  }
  
  protected void emitRunningDinnerSettingsUpdatedEvent(RunningDinnerSettingsUpdatedEvent runningDinnerSettingsUpdatedEvent) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyRunningDinnerSettingsUpdated(runningDinnerSettingsUpdatedEvent);
      }
    });
  }

  private void emitNewRunningDinnerEvent(final RunningDinner result) {

    // Publish event only after transaction is successfully committed:
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyNewRunningDinner(result);
      }
    });
  }  

  private void emitRunningDinnerCancelledEvent(final RunningDinner result) {

    // Publish event only after transaction is successfully committed:
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyRunningDinnerCancelled(result);
      }
    });
  } 
  
  private void generatePublicIdIfNotExisting(PublicSettings publicSettings) {

    if (StringUtils.isEmpty(publicSettings.getPublicId())) {
      String publicId = idGenerator.generatePublicId();
      publicSettings.setPublicId(publicId);
    }
  }
  
  @Override
  public void setApplicationContext(ApplicationContext applicationContext)
    throws BeansException {

    this.applicationContext = applicationContext;
  }


}
