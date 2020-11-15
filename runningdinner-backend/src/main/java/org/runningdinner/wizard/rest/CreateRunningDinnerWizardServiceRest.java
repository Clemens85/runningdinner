package org.runningdinner.wizard.rest;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.RunningDinnerAdminTO;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.contract.Contract;
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
	
//	@RequestMapping(value = "upload/participants", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//	public FileUploadTO uploadParticipantFile(@RequestParam("file") MultipartFile uploadFile, HttpServletRequest request)
//			throws IOException {
//
//		if (uploadFile.isEmpty()) {
//			throw new TechnicalException(new IssueList(new Issue("Upload contained no file", IssueType.TECHNICAL)));
//		}
//
//		FileUploadTO result = new FileUploadTO();
//
//		try (InputStream inputStream = uploadFile.getInputStream()) {
//			String fileName = createWizardService.generateUniqueUploadFilename(uploadFile.getOriginalFilename());
//			result.setFileId(createWizardService.writeFileToTempDirectory(inputStream, fileName));
//		}
//
//		List<FileUploadRowTO> rows = createWizardService.readFirstRowsOfUploadedFile(result.getFileId(), 2);
//		result.setPreviewRows(rows);
//		return result;
//	}
//
//	@RequestMapping(value = "upload/participants/columnmappingoptions", method = RequestMethod.GET)
//	public List<SelectOptionTO> getColumnMappingOptions() {
//
//		return ColumnMappingTO.getAllMappingOptions();
//	}
//
//	@RequestMapping(value = "upload/participants/parse", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
//	public ParsingResultTO parseUploadedParticipantFile(@RequestParam(value = "teamSize", defaultValue = "2") int teamSize,
//			@RequestParam("numberOfMeals") int numberOfMeals, @RequestBody @Valid ParticipantUploadSettingsTO participantUploadSettings) {
//
//		String fileId = participantUploadSettings.getFileId();
//		ParsingConfigurationTO parsingConfigurationTO = participantUploadSettings.getParsingConfiguration();
//		ParsingConfiguration parsingConfiguration = parsingConfigurationTO.toParsingConfiguration();
//
//		try {
//			List<Participant> allParticipants = createWizardService.parseUploadedParticipantFile(fileId, parsingConfiguration);
//			List<Participant> notAssignableParticipants = createWizardService.getNotAssignableParticipants(allParticipants, teamSize,
//					numberOfMeals);
//
//			List<ParticipantTO> participantsWithAssignmentInfo = new ArrayList<>();
//			for (Participant participant : allParticipants) {
//				boolean assignable = true;
//				if (notAssignableParticipants.contains(participant)) {
//					assignable = false;
//				}
//				participant.setAssignmentType(assignable ? AssignmentType.ASSIGNABLE : AssignmentType.NOT_ASSIGNABLE);
//				participantsWithAssignmentInfo.add(new ParticipantTO(participant));
//			}
//			return ParsingResultTO.createSuccess(participantsWithAssignmentInfo);
//		}
//		catch (ConversionException e) {
//			ParsingResultTO result = ParsingResultTO.createFailure(e.getConversionError(), e.getAbsoluteRowIndex() + 1);
//			Optional<FileUploadRowTO> failedRow = createWizardService.getFailedRow(fileId, e);
//			if (failedRow.isPresent()) {
//				result.setFailedRow(failedRow.get());
//			}
//			return result;
//		}
//	}

}
