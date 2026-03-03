package org.runningdinner.mail;

/**
 * Interface used by email formatters to retrieve (or create) a portal token for an email address.
 * Placed in the mail package so that email formatters can depend on it without importing from
 * the portal package (avoids core→portal coupling).
 */
public interface PortalTokenProvider {

  /**
   * Returns an existing portal token for the given email, or creates and persists a new one.
   *
   * @param email the email address for which to retrieve or create a portal token
   * @return the (existing or newly created) portal token string
   */
  String getOrCreatePortalToken(String email);
}
