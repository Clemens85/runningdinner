package org.runningdinner.initialization;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.RunningDinnerAdminTO;
import org.runningdinner.core.RunningDinner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/developservice/v1/runningdinner", produces = MediaType.APPLICATION_JSON_VALUE)
@Profile("dev")
public class DevelopOnlyRestController {

	@Autowired
	private RunningDinnerService runningDinnerService;
	
  @PutMapping("/{adminId}/acknowledge")
  public RunningDinnerAdminTO acknowledgeRunningDinner(@PathVariable String adminId, Locale locale) {
    
  	RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    UUID acknowledgeId = runningDinner.getObjectId();
		RunningDinner result = runningDinnerService.acknowledgeRunningDinner(adminId, acknowledgeId, LocalDateTime.now());
    return mapRunningDinnerAdminTO(result, locale);
  }
  
  private RunningDinnerAdminTO mapRunningDinnerAdminTO(RunningDinner runningDinner, Locale locale) {
    
    RunningDinnerAdminTO result = new RunningDinnerAdminTO(runningDinner);
    result.setSessionData(runningDinnerService.calculateSessionData(runningDinner, locale));
    return result;
  }
  
}
