package org.runningdinner.admin;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.event.RunningDinnerSettingsUpdatedEvent;
import org.runningdinner.geocoder.AfterPartyLocationGeocodeEventPublisher;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.runningdinner.participant.ParticipantAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class AfterPartyLocationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(AfterPartyLocationService.class);
  
  private final RunningDinnerService runningDinnerService;
  
  private final AfterPartyLocationGeocodeEventPublisher afterPartyLocationGeocodeEventPublisher;

  private final LocalizationProviderService localizationProviderService;
  
  private final MessageSource messageSource;
  
  public AfterPartyLocationService(RunningDinnerService runningDinnerService,
      AfterPartyLocationGeocodeEventPublisher afterPartyLocationGeocodeEventPublisher,
      LocalizationProviderService localizationProviderService,
      MessageSource messageSource) {
    
    this.runningDinnerService = runningDinnerService;
    this.afterPartyLocationGeocodeEventPublisher = afterPartyLocationGeocodeEventPublisher;
    this.localizationProviderService = localizationProviderService;
    this.messageSource = messageSource;
  }
  
  public static void validateAfterPartyLocation(AfterPartyLocation afterPartyLocation) {
    if (afterPartyLocation == null) {
		}
    // Nothing needs to be done in here
  }
  
  public void putGeocodeEventToQueue(final RunningDinner runningDinner) {
    
    if (runningDinner.getRunningDinnerType() == RunningDinnerType.DEMO || runningDinner.getAfterPartyLocation().isEmpty()) {
      return;
    }
    try {
      afterPartyLocationGeocodeEventPublisher.sendMessageToQueueAsync(runningDinner);
    } catch (Exception e) { 
      LOGGER.error("Error while calling sendMessageToQueueAsync for {}", runningDinner, e);
    }
  }
  
  @Transactional
  public RunningDinner updateAfterPartyLocationGeocode(String adminId, GeocodingResult incomingGeocodingResult) {

    LOGGER.info("Update geocode of after party location of running dinner {}", adminId);

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    if (runningDinner.getAfterPartyLocation().isEmpty()) {
      return runningDinner;
    }
    
    runningDinner.getAfterPartyLocation().get().setGeocodingResult(incomingGeocodingResult);
    return runningDinnerService.saveRunningDinner(runningDinner); 
  }
  
  @Transactional
  public RunningDinner updateAfterPartyLocation(@ValidateAdminId String adminId, AfterPartyLocation incomingAfterPartyLocation) {

    RunningDinner dinnerToUpdate = runningDinnerService.findRunningDinnerByAdminId(adminId);

    validateAfterPartyLocation(incomingAfterPartyLocation);
    
    AfterPartyLocation afterPartyLocationToUpdate = dinnerToUpdate.getAfterPartyLocation().orElse(null);
    if (afterPartyLocationToUpdate == null) {
      afterPartyLocationToUpdate = new AfterPartyLocation();
      dinnerToUpdate.setAfterPartyLocation(afterPartyLocationToUpdate);
    }
    
    AfterPartyLocation.copyValues(incomingAfterPartyLocation, afterPartyLocationToUpdate);
    RunningDinner result = runningDinnerService.saveRunningDinner(dinnerToUpdate); 
            
    runningDinnerService.emitRunningDinnerSettingsUpdatedEvent(new RunningDinnerSettingsUpdatedEvent(this, result));
    
    return result;
  }
  
  @Transactional
  public RunningDinner deleteAfterPartyLocation(String adminId) {
    
    RunningDinner dinnerToUpdate = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    AfterPartyLocation oldAfterPartyLocation = dinnerToUpdate.getAfterPartyLocation().orElse(null);
    if (oldAfterPartyLocation == null) {
      LOGGER.warn("Could not delete after party location in {} due to it did not exist", dinnerToUpdate);
      return dinnerToUpdate;
    }
    
    dinnerToUpdate.setAfterPartyLocation(new AfterPartyLocation()); // This clears out all values and hence delete the After Party Location
    
    RunningDinner result = runningDinnerService.saveRunningDinner(dinnerToUpdate); 
    runningDinnerService.emitRunningDinnerSettingsUpdatedEvent(new RunningDinnerSettingsUpdatedEvent(this, result));

    return result;
  }
  
  public String replaceAfterPartyLocationTemplate(String message, RunningDinner runningDinner) {
    if (runningDinner.getAfterPartyLocation().isEmpty()) {
      return message;
    }
    return message.replaceAll(FormatterUtil.AFTER_PARTY_LOCATION, generateAfterPartyLocationString(runningDinner));
  }
  
  private String generateAfterPartyLocationString(RunningDinner runningDinner) {
  
    AfterPartyLocation afterPartyLocation = runningDinner.getAfterPartyLocation().orElse(null);
    if (afterPartyLocation == null) {
      return StringUtils.EMPTY;
    }
    
    String result = StringUtils.EMPTY;
    if (StringUtils.isNotEmpty(afterPartyLocation.getAddressName())) {
      result = afterPartyLocation.getAddressName() + FormatterUtil.NEWLINE;
    }
    
    result += ParticipantAddress.formatStreetWithNr(afterPartyLocation.getStreet(), afterPartyLocation.getStreetNr()) + FormatterUtil.NEWLINE;
    result += ParticipantAddress.formatZipWithCity(afterPartyLocation.getZip(), afterPartyLocation.getCityName());
    if (StringUtils.isNotEmpty(afterPartyLocation.getAddressRemarks())) {
      result += FormatterUtil.NEWLINE + afterPartyLocation.getAddressRemarks();
    }
    
    result += FormatterUtil.NEWLINE + getFormattedTime(afterPartyLocation.getTime(), runningDinner);
    return result;
  }
  
  private String getFormattedTime(LocalDateTime time, RunningDinner runningDinner) {

    Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    DateTimeFormatter timeFormatter = localizationProviderService.getTimeFormatterOfDinner(runningDinner);
    String formattedTime = FormatterUtil.getFormattedTime(time, timeFormatter, StringUtils.EMPTY);
    return messageSource.getMessage("uhr", new Object[] { formattedTime }, locale);
  }

}
