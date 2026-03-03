package org.runningdinner.portal;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PortalTokenNotFoundException extends RuntimeException {

  public PortalTokenNotFoundException(String message) {
    super(message);
  }
}
