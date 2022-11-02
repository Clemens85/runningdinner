package org.runningdinner.admin;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.core.RunningDinner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReSendRunningDinnerCreatedMessageService {
	
  private static Logger LOGGER = LoggerFactory.getLogger(ReSendRunningDinnerCreatedMessageService.class);

	private RunningDinnerService runningDinnerService;
	
	private MessageService messageService;

	@Autowired
	public ReSendRunningDinnerCreatedMessageService(RunningDinnerService runningDinnerService,
			MessageService messageService) {
		this.runningDinnerService = runningDinnerService;
		this.messageService = messageService;
	}
	
	@Transactional
	public RunningDinner reSendRunningDinnerCreatedMessage(@ValidateAdminId String adminId, ReSendRunningDinnerCreatedMessage reSendRunningDinnerCreatedMesssage) {
		
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		if (runningDinner.isAcknowledged()) {
	  	LOGGER.warn("{} is already acknowledged but was tried to re-send the initial email", runningDinner);
		  return runningDinner;
	  }
		
		String newEmailAddress = reSendRunningDinnerCreatedMesssage.getNewEmailAddress();
		if (StringUtils.isNotEmpty(newEmailAddress) && !StringUtils.equalsIgnoreCase(newEmailAddress, runningDinner.getEmail())) {
			runningDinner = runningDinnerService.updateRunningDinnerAdminEmail(adminId, newEmailAddress);
		}

		messageService.sendRunningDinnerCreatedMessage(runningDinner);

		return runningDinner;
	}
	
	
}
