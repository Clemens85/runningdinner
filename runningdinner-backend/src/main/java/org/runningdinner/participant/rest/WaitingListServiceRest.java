package org.runningdinner.participant.rest;

import java.util.List;

import org.runningdinner.participant.WaitingListActionResult;
import org.runningdinner.participant.WaitingListData;
import org.runningdinner.participant.WaitingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/waitinglistservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class WaitingListServiceRest {

	@Autowired
	private WaitingListService waitingListService;
	
  @GetMapping("/runningdinner/{adminId}")
  public WaitingListData findWaitingListData(@PathVariable String adminId) {
 
    WaitingListData waitingListData = waitingListService.findWaitingListData(adminId);
    return waitingListData;
  }
	
  @PutMapping("/runningdinner/{adminId}/generate-new-teams")
  public WaitingListActionResult generateNewTeams(@PathVariable String adminId, @RequestBody WaitingListGenerateTeamsRequestTO waitingListGenerateTeamsRequest) {

  	List<ParticipantTO> participants = waitingListGenerateTeamsRequest.getParticipants();
  	return waitingListService.generateNewTeams(adminId, participants);
  }
  
  @PutMapping("/runningdinner/{adminId}/assign-participants-teams")
  public WaitingListActionResult assignParticipantsToExistingTeams(@PathVariable String adminId, 
  																															 @RequestBody @Validated TeamParticipantsAssignmentListTO teamParticipantsAssignmentList) {
  	
  	return waitingListService.assignParticipantsToExistingTeams(adminId, teamParticipantsAssignmentList.getTeamParticipantsAssignments());
  }
  
}
