package org.runningdinner.frontend.rest;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import javax.validation.Valid;

import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/frontend/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class FrontendRunningDinnerServiceRest {

	@Autowired
	private FrontendRunningDinnerService frontendRunningDinnerService;

	@RequestMapping(value = "/runningdinner/{publicDinnerId}", method = RequestMethod.GET)
	public RunningDinnerPublicTO getRunningDinner(@PathVariable("publicDinnerId") String publicDinnerId, Locale locale) {

		LocalDate now = LocalDate.now();
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, now);
		return new RunningDinnerPublicTO(runningDinner, now);
	}

	@RequestMapping(value = "/runningdinner", method = RequestMethod.GET)
	public RunningDinnerPublicListTO getPublicRunningDinnerList() {

	  LocalDate now = LocalDate.now();
		List<RunningDinner> publicRunningDinners = frontendRunningDinnerService.findPublicRunningDinners(now);
		return new RunningDinnerPublicListTO(publicRunningDinners, now);
	}

	@RequestMapping(value = "/runningdinner/{publicDinnerId}/register", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public RegistrationSummaryTO performRegistration(@PathVariable("publicDinnerId") String publicDinnerId,
			                                             @RequestParam(name = "validateOnly", defaultValue = "true") boolean onlyPreviewAndValidation,
			                                             @RequestBody @Valid RegistrationDataTO registrationData) {

		RegistrationDataV2TO registrationDataV2 = new RegistrationDataV2TO();

		registrationDataV2.setAge(registrationData.getAge());
		registrationDataV2.setEmail(registrationData.getEmail());
		registrationDataV2.setMobileNumber(registrationData.getMobile());
		ParticipantName participantName = ParticipantName.newName().withCompleteNameString(registrationData.getFullname());
		registrationDataV2.setFirstnamePart(participantName.getFirstnamePart());
		registrationDataV2.setLastname(participantName.getLastname());
		
		registrationDataV2.setCityName(registrationData.getCity());
		ParticipantAddress tmpAddress = new ParticipantAddress();
		tmpAddress.setStreetAndNr(registrationData.getStreetWithNr());
    registrationDataV2.setStreet(tmpAddress.getStreet());
    registrationDataV2.setStreetNr(tmpAddress.getStreetWithNr());
    registrationDataV2.setZip(registrationData.getZip());
    registrationDataV2.setAddressRemarks(registrationData.getAddressRemarks());
    registrationDataV2.setGender(registrationData.getGender());

    MealSpecifics mealSpecifics = registrationData.getMealSpecifics();
    registrationDataV2.setVegan(mealSpecifics.isVegan());
    registrationDataV2.setVegetarian(mealSpecifics.isVegetarian());
    registrationDataV2.setGluten(mealSpecifics.isGluten());
    registrationDataV2.setLactose(mealSpecifics.isLactose());
    registrationDataV2.setMealSpecificsNote(mealSpecifics.getNote());

    registrationDataV2.setTeamPartnerWish(registrationData.getTeamPartnerWish());
    registrationDataV2.setNotes(registrationData.getNotes());
		
		RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationDataV2, onlyPreviewAndValidation);
		return new RegistrationSummaryTO(result);
	}

	@RequestMapping(value = "/runningdinner/{publicDinnerId}/{participantId}/activate", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
  public void activateSubscribedParticipant(@PathVariable("publicDinnerId") String publicDinnerId,
                                            @PathVariable("participantId") UUID participantId) {

    frontendRunningDinnerService.activateSubscribedParticipant(publicDinnerId, participantId);
  }
	
}
