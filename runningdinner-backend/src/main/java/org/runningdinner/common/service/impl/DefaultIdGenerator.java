
package org.runningdinner.common.service.impl;

import java.util.UUID;
import java.util.regex.Pattern;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.service.IdGenerator;

public class DefaultIdGenerator implements IdGenerator {

  static final int NUM_CHARS_FRONTEND_ID = 10;
  static final int NUM_CHARS_ADMIN_ID = 36 + 1 + 5;

  @Override
  public String generateAdminId() {

    UUID generatedUUID = UUID.randomUUID();
    String result = generatedUUID.toString();
    result += "-" + RandomStringUtils.randomAlphanumeric(5);
    return result;
  }

  @Override
  public String generatePublicId() {

    String shortUuid = RandomStringUtils.randomAlphanumeric(NUM_CHARS_FRONTEND_ID);
    return shortUuid;
  }

  @Override
  public boolean isAdminIdValid(final String incomingAdminId) {

    String adminId = incomingAdminId;

    final int uuidLength = 36; // UUID is composed of 32 digits and 4 separator chars

    if (StringUtils.isEmpty(adminId) || StringUtils.length(adminId) != NUM_CHARS_ADMIN_ID) {
      return false;
    }

    String uuid = adminId.substring(0, uuidLength);
    boolean validUUID = Pattern.matches("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}", uuid);
    if (!validUUID) {
      return false;
    }

    String remainder = adminId.substring(uuidLength);
    if (!remainder.substring(0, 1).equals("-")) {
      return false;
    }

    return StringUtils.isAlphanumeric(remainder.substring(1));
  }

  @Override
  public boolean isPublicIdValid(String shortUuid) {

    return StringUtils.length(shortUuid) == NUM_CHARS_FRONTEND_ID;
  }

}
