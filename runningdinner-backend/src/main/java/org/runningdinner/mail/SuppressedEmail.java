
package org.runningdinner.mail;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.core.util.DateTimeUtil;
import org.springframework.util.Assert;

import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SuppressedEmail {

  @JsonProperty
  private long created;

  @JsonProperty
  private String email;

  @JsonProperty
  private String reason;

  @JsonProperty
  private String status;
  
  @JsonProperty
  private String ip;
  
  private FailureType failureType;

  public long getCreated() {

    return created;
  }
  
  public LocalDateTime getCreatedAsLocalDateTime() {

    return DateTimeUtil.fromUnixTimestamp(getCreated());
  }

  public void setCreated(long created) {

    this.created = created;
  }

  public String getEmail() {

    return email;
  }

  public void setEmail(String email) {

    this.email = email;
  }

  public String getReason() {

    return reason;
  }

  public void setReason(String reason) {

    this.reason = reason;
  }

  public String getStatus() {

    return status;
  }

  public void setStatus(String status) {

    this.status = status;
  }

  public FailureType getFailureType() {

    Assert.notNull(failureType, "failureType must be set");
    return failureType;
  }

  public void setFailureType(FailureType failureType) {

    this.failureType = failureType;
  }
  
  public String getIp() {
  
    return ip;
  }
  
  public void setIp(String ip) {
  
    this.ip = ip;
  }

  @Override
  public String toString() {

    return MoreObjects
            .toStringHelper(this)
            .addValue(email)
            .addValue(reason)
            .toString();
  }
}
