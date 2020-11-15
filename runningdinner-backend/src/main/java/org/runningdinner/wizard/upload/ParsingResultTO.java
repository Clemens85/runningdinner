
package org.runningdinner.wizard.upload;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.runningdinner.core.converter.ConversionException.CONVERSION_ERROR;
import org.runningdinner.participant.rest.ParticipantTO;

public class ParsingResultTO implements Serializable {

  private static final long serialVersionUID = 1L;

  private boolean success = true;

  private FileUploadRowTO failedRow;

  private int failedRowNumber;
  private CONVERSION_ERROR errorType;

  private List<ParticipantTO> participants = new ArrayList<>();

  public boolean isSuccess() {

    return success;
  }

  public void setSuccess(boolean success) {

    this.success = success;
  }

  public FileUploadRowTO getFailedRow() {

    return failedRow;
  }

  public void setFailedRow(FileUploadRowTO failedRow) {

    this.failedRow = failedRow;
    this.success = false;
  }

  public CONVERSION_ERROR getErrorType() {

    return errorType;
  }

  public void setErrorType(CONVERSION_ERROR errorType) {

    this.errorType = errorType;
    this.success = false;
  }

  public int getFailedRowNumber() {

    return failedRowNumber;
  }

  public void setFailedRowNumber(int failedRowNumber) {

    this.failedRowNumber = failedRowNumber;
    this.success = false;
  }

  public List<ParticipantTO> getParticipants() {

    return participants;
  }

  public void setParticipants(List<ParticipantTO> participants) {

    this.participants = participants;
  }

  public static ParsingResultTO createSuccess(List<ParticipantTO> participants) {

    ParsingResultTO result = new ParsingResultTO();
    result.setParticipants(participants);
    result.setSuccess(true);
    return result;
  }

  public static ParsingResultTO createFailure(CONVERSION_ERROR errorType, int failedRowNumber) {

    ParsingResultTO result = new ParsingResultTO();
    result.setErrorType(errorType);
    result.setFailedRowNumber(failedRowNumber);
    result.setSuccess(false);
    return result;
  }

}
