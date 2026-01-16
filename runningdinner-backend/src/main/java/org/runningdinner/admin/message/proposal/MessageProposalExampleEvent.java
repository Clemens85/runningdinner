package org.runningdinner.admin.message.proposal;

import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.admin.message.job.MessageJob;

public record MessageProposalExampleEvent(MessageJob messageJob, BaseMessage messageTemplate) {
}
