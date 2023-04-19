package org.runningdinner.wizard.rest;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.RunningDinnerAdminTO;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.contract.Contract;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.wizard.BasicDetailsTO;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.runningdinner.wizard.OptionsTO;
import org.runningdinner.wizard.PublicSettingsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/wizardservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class CreateRunningDinnerWizardServiceRest {

	@Autowired
	private CreateRunningDinnerWizardService createWizardService;

	@Autowired
	private UrlGenerator urlGenerator;

	@RequestMapping(value = "/validate/basicdetails", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
	public void validateBasicDetails(@Valid @RequestBody BasicDetailsTO basicDetails, Locale locale) {

		RunningDinnerService.validateRunningDinnerDate(basicDetails.getDate());
	}

	@RequestMapping(value = "/validate/options", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
	public void validateOptions(
			@Valid @RequestBody OptionsTO options,
			@RequestParam("runningDinnerDate") @Valid @NotNull(message = "error.required.date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate runningDinnerDate,
			Locale locale) {

		List<MealClass> meals = options.getMeals();
		createWizardService.validateMeals(meals, runningDinnerDate);
	}

	@RequestMapping(value = "/validate/publicsettings", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
	public void validatePublicSettings(
			@Valid @RequestBody PublicSettingsTO publicSettings,
			@RequestParam("runningDinnerDate") @Valid @NotNull(message = "error.required.date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate runningDinnerDate,
			Locale locale) {
		
	  RunningDinnerService.validatePublicSettings(publicSettings, runningDinnerDate);
	}

    @RequestMapping(value = "/validate/afterpartylocation", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
    public void validateAfterPartyLocation(
            @Valid @RequestBody AfterPartyLocation afterPartyLocation,
            Locale locale) {
        
      AfterPartyLocationService.validateAfterPartyLocation(afterPartyLocation);
    }
	
	@RequestMapping(value = "/create", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public CreatedRunningDinnerResponseTO createRunningDinner(@Valid @RequestBody RunningDinnerAdminTO runningDinnerTO, HttpServletRequest request) {

	  if (runningDinnerTO.getContract() != null) {
	    Contract contract = runningDinnerTO.getContract();
	    contract.setIp(request.getRemoteAddr());
	  }
	  
	  RunningDinner createdRunningDinner = createWizardService.createRunningDinner(runningDinnerTO);

	  RunningDinnerAdminTO createdRunningDinnerTO = new RunningDinnerAdminTO(createdRunningDinner);
	  String administrationUrl = urlGenerator.constructAdministrationUrl(createdRunningDinner.getAdminId());
	  return new CreatedRunningDinnerResponseTO(createdRunningDinnerTO, administrationUrl);
	}

}
