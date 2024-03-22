
package org.runningdinner.admin.message.job;

import java.time.LocalDateTime;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import org.apache.commons.lang3.StringUtils;

import com.google.common.base.MoreObjects;

@Embeddable
public class SendingResult {

  private boolean delieveryFailed = false;

  private String failureMessage;

  @Enumerated(EnumType.STRING)
  private FailureType failureType;
  
  private LocalDateTime delieveryFailedDate;

  public boolean isDelieveryFailed() {

    return delieveryFailed;
  }

  public void setDelieveryFailed(boolean delieveryFailed) {

    this.delieveryFailed = delieveryFailed;
  }

  public String getFailureMessage() {

    return failureMessage;
  }

  public void setFailureMessage(String failureMessage) {

    this.failureMessage = StringUtils.truncate(failureMessage, 512);
  }

  public FailureType getFailureType() {

    return failureType;
  }

  public void setFailureType(FailureType failureType) {

    this.failureType = failureType;
  }
  
  public LocalDateTime getDelieveryFailedDate() {
  
    return delieveryFailedDate;
  }
  
  public void setDelieveryFailedDate(LocalDateTime delieveryFailedDate) {
  
    this.delieveryFailedDate = delieveryFailedDate;
  }

  @Override
  public String toString() {
    
    return MoreObjects
            .toStringHelper(this)
            .addValue(delieveryFailed)
            .addValue(failureType)
            .toString();
  }
}
