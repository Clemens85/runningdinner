package org.runningdinner.common.rest;

import java.util.List;
import java.util.Locale;

import javax.persistence.EntityNotFoundException;
import javax.servlet.http.HttpServletRequest;

import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.DinnerNotAcknowledgedException;
import org.runningdinner.common.exception.DinnerNotFoundException;
import org.runningdinner.common.exception.InvalidUuidException;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.InvalidAddressException;
import org.runningdinner.core.InvalidAddressException.ADDRESS_ERROR;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalExceptionMapper {

  private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionMapper.class);

	@Autowired
	private ValidatorService validatorService;

  @Autowired
  private MessageSource messages;
	
  @Value("${contact.mail}")
	private String adminEmail;
	
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(DinnerNotFoundException.class)
	@ResponseBody
	IssueList mapDinnerNotFoundException(final HttpServletRequest req, final Locale locale, final Exception ex) {
		String message = messages.getMessage("error.page.dinner.notfound.details", null, locale);
		LOGGER.error(ex.getMessage(), ex);
		return new IssueList(new Issue(message, IssueType.BAD_REQUEST));
	}
	
	@ResponseStatus(HttpStatus.FAILED_DEPENDENCY)
  @ExceptionHandler(DinnerNotAcknowledgedException.class)
  @ResponseBody
  IssueList mapDinnerNotAcknowledgedException(final HttpServletRequest req, final Locale locale, final Exception ex) {

	  String message = messages.getMessage("error.dinner.acknowledge.required", null, locale);
	  message = message.replaceAll(FormatterUtil.EMAIL, adminEmail);
	  LOGGER.error(ex.getMessage(), ex);
	  return new IssueList(new Issue(message, IssueType.BAD_REQUEST));
  }

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(value = { InvalidUuidException.class, EntityNotFoundException.class, IllegalStateException.class })
	@ResponseBody
	IssueList mapInvalidUuidException(final HttpServletRequest req, final Locale locale, final Exception ex) {
		String message = "Eingehender Request war fehlerhaft, bitte versuche es zu einem späteren Zeitpunkt erneut!";
		LOGGER.error(ex.getMessage(), ex);
		return new IssueList(new Issue(message, IssueType.BAD_REQUEST));
	}

	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ExceptionHandler(InvalidAddressException.class)
	@ResponseBody
	IssueList mapInvalidAddressException(final HttpServletRequest req, final Locale locale, final InvalidAddressException ex) {
		ADDRESS_ERROR errorType = ex.getErrorType();
		IssueList result = new IssueList();
		if (errorType == ADDRESS_ERROR.ADDRESS_FORMAT_INVALID) {
			result.addIssue(new Issue(IssueKeys.ADDRESS_FORMAT_INVALID, IssueType.VALIDATION));
		}
		else if (errorType == ADDRESS_ERROR.STREET_STREETNR_INVALID) {
			result.addIssue(new Issue("streetWithNr", IssueKeys.ADDRESS_STREET_NR_INVALID, IssueType.VALIDATION));
		}
		else if (errorType == ADDRESS_ERROR.ZIP_CITY_INVALID) {
			result.addIssue(new Issue(IssueKeys.ADDRESS_CITY_ZIP_INVALID, IssueType.VALIDATION));
		}
		return result;
	}

	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ExceptionHandler(ValidationException.class)
	@ResponseBody
	IssueList mapValidationException(final HttpServletRequest req, final Locale locale, final Exception ex) {
		ValidationException validationException = (ValidationException)ex;
		LOGGER.error("Validation-Error: {}", validationException.getIssues(), ex);
		return validationException.getIssues();
	}

	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseBody
	IssueList processValidationError(final MethodArgumentNotValidException ex) {
		BindingResult result = ex.getBindingResult();
		List<FieldError> fieldErrors = result.getFieldErrors();
    IssueList issueList = validatorService.processFieldErrors(fieldErrors);
    LOGGER.error("MethodArgumentNotValidException: {}", issueList, ex);
    return issueList;
  }

	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ExceptionHandler(TechnicalException.class)
	@ResponseBody
	IssueList mapTechnicalException(final HttpServletRequest req, final Locale locale, final Exception ex) {
		TechnicalException technicalException = (TechnicalException)ex;
		LOGGER.error(ex.getMessage(), ex);
		return technicalException.getIssues();
	}
	
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ExceptionHandler(RuntimeException.class)
	@ResponseBody
	IssueList processUncatchedException(final HttpServletRequest req, final Locale locale, final Exception ex) {
		LOGGER.error("Unexpected error", ex);
		String message = messages.getMessage("error.general", null, locale);
		return new IssueList(new Issue(message, IssueType.TECHNICAL));
	}

}
