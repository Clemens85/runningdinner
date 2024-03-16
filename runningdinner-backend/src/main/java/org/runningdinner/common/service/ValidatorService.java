
package org.runningdinner.common.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Path;
import jakarta.validation.Path.Node;
import jakarta.validation.Validator;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.DinnerNotFoundException;
import org.runningdinner.common.exception.InvalidUuidException;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.RunningDinner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.validation.FieldError;

import com.google.common.base.CaseFormat;

@Service
public class ValidatorService {

  @Autowired
  private IdGenerator idGenerator;

  @Autowired
  private MessageSource messages;

  @Autowired
  private Validator validator;
  
  public void invokeValidation(String prefix, Object obj) {
    
    List<FieldError> fieldErrors = new ArrayList<>();
    
    Set<ConstraintViolation<Object>> violations = validator.validate(obj);
    
    for (ConstraintViolation<Object> violation : violations) {
      String message = violation.getMessage();
      
      String[] codes = getCodesFromViolation(violation);
      
      FieldError fieldError = new FieldError(prefix, getPropertyPathName(prefix, violation.getPropertyPath()), violation.getInvalidValue(), false, 
                                             codes, new Object[0], message);
      fieldErrors.add(fieldError);
    }
    
    if (CollectionUtils.isNotEmpty(fieldErrors)) {
      IssueList issueList = processFieldErrors(fieldErrors);
      throw new ValidationException(issueList);
    }
  }
  
  private String[] getCodesFromViolation(ConstraintViolation<Object> violation) {

    String[] result = new String[1];
    
    String messageTemplate = violation.getMessageTemplate();
    if (StringUtils.contains(messageTemplate, ".NotBlank") || StringUtils.contains(messageTemplate, ".NotNull")) {
      result[0] = "NotBlank";
    } else if (StringUtils.contains(messageTemplate, ".NotEmpty")) {
      result[0] = "NotEmpty";
    } else if (StringUtils.contains(messageTemplate, ".Email") || StringUtils.contains(messageTemplate, ".Size") || StringUtils.contains(messageTemplate, ".Length")) {
      result[0] = "Size";
    } else {
      result[0] = violation.getMessage();
    }
    return result;
  }

  public IssueList processFieldErrors(final List<FieldError> fieldErrors) {
    IssueList result = new IssueList();

    for (FieldError fieldError : fieldErrors) {
      String localizedErrorMessage = resolveLocalizedErrorMessage(fieldError);
      result.addIssue(new Issue(fieldError.getField(), localizedErrorMessage, IssueType.VALIDATION));
    }

    return result;
  }
  
  /**
   * Performs a pre-validation whether a passed dinner-UUID is valid after all. Thus we avoid passing an invalid UUID to the database.
   * 
   * @param adminId
   * @throws InvalidUuidException If passed uuid is not valid
   */
  public void checkAdminIdValid(final String adminId) {

    if (!idGenerator.isAdminIdValid(adminId)) {
      throw new InvalidUuidException("Invalid adminId passed!");
    }
  }

  public void checkPublicIdValid(final String publicId) {

    if (!idGenerator.isPublicIdValid(publicId)) {
      throw new InvalidUuidException("Invalid publicId passed!");
    }
  }

  public void checkRunningDinnerNotNull(final RunningDinner runningDinner) {

    if (runningDinner == null) {
      throw new DinnerNotFoundException();
    }
  }

  public void checkRunningDinnerNotExpired(RunningDinner runningDinner, LocalDate now) {

    if (runningDinner.getDate().isBefore(now)) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.RUNNINGDINNER_DATE_EXPIRED, IssueType.VALIDATION)));
    }
  }

  public boolean isEmailValid(final String email) {

    if (StringUtils.isNotEmpty(email)) {
      return email.contains("@");
    }
    return false;
  }

  /**
   * Checks whether the passed string seems to be a valid european style fullname.<br>
   * This involves mainly the check of the existence of whitespaces within the passed string.
   *  
   * @param fullname
   */
  public boolean isValidFullname(String fullname) {

    String fullnameTrimmed = StringUtils.trim(fullname);
    if (StringUtils.isEmpty(fullnameTrimmed)) {
      return false;
    }

    String[] nameParts = fullnameTrimmed.split("\\s+");

    // Name must be at least in form of FIRSTNAME LASTNAME, but can also be something like FIRSTNAME SECONDNAME THIRDNAME von LASTNAME.
    // If one has really an even more complicated name then he has surely also other problems... ;-)
    return nameParts != null && nameParts.length > 1 && nameParts.length <= 5;

  }

  public void checkEntityNotNull(AbstractEntity entity) {

    if (entity == null) {
      throw new EntityNotFoundException();
    }
  }

  public void checkEntityNotNull(AbstractEntity entity, String message) {

    if (entity == null) {
      throw new EntityNotFoundException(message);
    }    
  }
  
  
  private String resolveLocalizedErrorMessage(final FieldError fieldError) {
    
    Locale currentLocale = LocaleContextHolder.getLocale();
    
    if (isSafeHtmlError(fieldError)) {
      return messages.getMessage("error.safehtml", null, "Unsicherer Inhalt", currentLocale);
    }
   
    String messageCode = fieldError.getDefaultMessage();
    if (StringUtils.isNotEmpty(messageCode) && StringUtils.startsWith(messageCode, "error.")) {
      String result = messages.getMessage(messageCode, null, StringUtils.EMPTY, currentLocale);
      if (StringUtils.isNotEmpty(result)) {
        return result;
      }
    }
    
    if (isNotBlankOrNotNullError(fieldError)) {
      String fieldNameTranslated = getFieldNameTranslated(fieldError);
      return messages.getMessage("error.required.field", new String[] { fieldNameTranslated }, currentLocale);
    }
    if (isEMailOrSizeOrLengthError(fieldError)) {
      String fieldNameTranslated = getFieldNameTranslated(fieldError);
      return messages.getMessage("error.invalid.field", new String[] { fieldNameTranslated }, currentLocale);
    }
    if (isNotEmptyError(fieldError)) {
      String fieldNameTranslated = getFieldNameTranslated(fieldError);
      return messages.getMessage("error.empty.field", new String[] { fieldNameTranslated }, currentLocale);
    }

    if (StringUtils.isEmpty(messageCode)) {
      return messages.getMessage(fieldError, currentLocale);
    }

    // If the message was not found, return the most accurate field error code instead.
    // You can remove this check if you prefer to get the default error message.
    return messages.getMessage(messageCode, null, messageCode, currentLocale);
  }

  private boolean isNotEmptyError(FieldError fieldError) {

    return isCodeContained(fieldError, "NotEmpty");
  }

  private boolean isEMailOrSizeOrLengthError(FieldError fieldError) {

    return isCodeContained(fieldError, "Email") || isCodeContained(fieldError, "Length") || isCodeContained(fieldError, "Size");
  }

  private String getFieldNameTranslated(FieldError fieldError) {

    Locale currentLocale = LocaleContextHolder.getLocale();
    
    String fieldName = fieldError.getField();
    
    String result = messages.getMessage(fieldName, null, StringUtils.EMPTY, currentLocale);
    if (StringUtils.isEmpty(result)) {
      fieldName = StringUtils.lowerCase(CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, fieldName));
      result = messages.getMessage(fieldName, null, fieldName, currentLocale);
    }
    
    return result;
  }

  private static boolean isSafeHtmlError(FieldError fieldError) {
    
    return isCodeContained(fieldError, "SafeHtml");
  }
  
  private static boolean isNotBlankOrNotNullError(FieldError fieldError) {

    return isCodeContained(fieldError, "NotBlank") || isCodeContained(fieldError, "NotNull");
  }
  
  private String getPropertyPathName(String prefix, Path propertyPath) {
    
    String result = StringUtils.isNotEmpty(prefix) ? prefix + "." : StringUtils.EMPTY;
    Iterator<Node> iter = propertyPath.iterator();
    
    int cnt = 0;
    while (iter.hasNext()) {
      Node propertyNode = iter.next();
      if (cnt++ > 0) {
        result += ".";
      }
      result += propertyNode;
    }
    return result;
  }
  
  private static boolean isCodeContained(FieldError fieldError, String codeToSearchFor) {
   
    String[] codes = fieldError.getCodes();
    if (codes != null) {
      for (String code : codes) {
        if (StringUtils.equalsIgnoreCase(code, codeToSearchFor)) {
          return true;
        }
      }
    }
    return false;
  }
  
}
