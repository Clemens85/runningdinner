package org.runningdinner.wizard.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.RunningDinnerAdminTO;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(value = "/rest/wizardservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class CreateRunningDinnerWizardServiceRest {

	@Autowired
	private CreateRunningDinnerWizardService createWizardService;

	@Autowired
	private UrlGenerator urlGenerator;

	@PutMapping(value = "/validate/basicdetails", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void validateBasicDetails(@Valid @RequestBody BasicDetailsTO basicDetails) {

		RunningDinnerService.validateRunningDinnerDate(basicDetails.getDate());
	}

	@PutMapping(value = "/validate/options", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void validateOptions(
			@Valid @RequestBody OptionsTO options,
			@RequestParam /*@Valid @NotNull(message = "error.required.date")*/ @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate runningDinnerDate) {

		checkRunningDinnerDateParamNotNull(runningDinnerDate);
		List<MealClass> meals = options.getMeals();
		createWizardService.validateMeals(meals, runningDinnerDate);
	}

	@PutMapping(value = "/validate/publicsettings", consumes = MediaType.APPLICATION_JSON_VALUE)
	public void validatePublicSettings(
			@Valid @RequestBody PublicSettingsTO publicSettings,
			@RequestParam /*@Valid @NotNull(message = "error.required.date")*/ @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate runningDinnerDate) {

		checkRunningDinnerDateParamNotNull(runningDinnerDate);
	  RunningDinnerService.validatePublicSettings(publicSettings, runningDinnerDate);
	}

	/**
	 * @Valid @NotNull annotation in rest method used with also @valid @RequestBody crashes complete validation, see here: https://github.com/spring-projects/spring-framework/issues/32396.
	 * We would have to implement an exception handler for HandlerMethodValidationException which is  much effort, hence we stick to this here.
	 * @param runningDinnerDate
	 */
	private void checkRunningDinnerDateParamNotNull(LocalDate runningDinnerDate) {
		if (runningDinnerDate == null) {
			throw new ValidationException(new IssueList(new Issue("error.required.date", IssueType.VALIDATION)));
		}
	}

    @PutMapping(value = "/validate/afterpartylocation", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void validateAfterPartyLocation(
            @Valid @RequestBody AfterPartyLocation afterPartyLocation) {
        
      AfterPartyLocationService.validateAfterPartyLocation(afterPartyLocation);
    }
	
	@PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
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
