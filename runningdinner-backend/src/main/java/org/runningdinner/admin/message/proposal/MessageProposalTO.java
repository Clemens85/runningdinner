package org.runningdinner.admin.message.proposal;

import java.util.Map;

public record MessageProposalTO(
    String subject,
    String messageTemplate,
    Map<String, String> additionalSections
) {

}
