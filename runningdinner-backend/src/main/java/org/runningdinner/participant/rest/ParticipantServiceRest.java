package org.runningdinner.participant.rest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.rest.RunningDinnerRelatedIdListTO;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.partnerwish.TeamPartnerWish;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/participantservice/v1")
public class ParticipantServiceRest {

	@Autowired 
	private ParticipantService participantService;
	
	@Autowired 
  private RunningDinnerService runningDinnerService;
	
	@Autowired
	private TeamPartnerWishService teamPartnerWishService;
	
	@RequestMapping(value = "/runningdinner/{adminId}/participants", method = RequestMethod.GET)
	public ParticipantListActive findActiveParticipantsList(@PathVariable("adminId") final String adminId) {

		ParticipantListActive result = participantService.findActiveParticipantList(adminId);
		return result;
	}

	@GetMapping(value = "/runningdinner/{adminId}/participants/export", produces = {MediaType.APPLICATION_OCTET_STREAM_VALUE})
	public void exportParticipants(@PathVariable("adminId") final String adminId, HttpServletResponse response) {

		String fileName = "participants-export.xlsx";

		response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
		response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");

		try {
			participantService.exportParticipantsAsExcel(adminId, response.getOutputStream());
		} catch (IOException e) {
			throw new TechnicalException(e);
		}
	}


	@RequestMapping(value = "/runningdinner/{adminId}/participants/{participantId}", method = RequestMethod.GET)
	public ParticipantTO findParticipant(@PathVariable("adminId") final String adminId,
																			 @PathVariable("participantId") final UUID participantId) {

		Participant participant = participantService.findParticipantById(adminId, participantId);
		return new ParticipantTO(participant);
	}

	@RequestMapping(value = "/runningdinner/{adminId}/participants/{participantId}/geocode", method = RequestMethod.PUT)
	public ParticipantTO updateParticipantGeocode(@PathVariable("adminId") final String adminId,
																			 	 			  @PathVariable("participantId") final UUID participantId,
																								@RequestBody GeocodingResult geocodingResult) {

		Participant participant = participantService.updateParticipantGeocode(adminId, participantId, geocodingResult);
		return new ParticipantTO(participant);
	}

  @RequestMapping(value = "/runningdinner/{adminId}/participants/not-active", method = RequestMethod.PUT)
  public ParticipantListInactive findNotActivatedParticipants(@PathVariable("adminId") final String adminId,
                                                        	 	  @RequestBody RunningDinnerRelatedIdListTO participantIdList) {

    Assert.state(StringUtils.equals(adminId, participantIdList.getAdminId()), "Expected adminId " + adminId + " in path to match id in participantIdList " + participantIdList);
    
    ParticipantListInactive result = new ParticipantListInactive();

    List<Participant> participants = participantService.findNotActivatedParticipantsByIds(adminId, participantIdList.getEntityIds());
    result.setParticipants(ParticipantTO.convertParticipantList(participants));
    result.setAdminId(adminId);

    return result;
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/participant/{participantId}/activate", method = RequestMethod.PUT)
  public ParticipantTO activateParticipantSubscription(@PathVariable("adminId") final String adminId,
                                                       @PathVariable("participantId") final UUID participantId) {

    LocalDateTime now = LocalDateTime.now();
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    Participant result = participantService.updateParticipantSubscription(participantId, now, false, runningDinner);
    return new ParticipantTO(result);
  }

	@RequestMapping(value = "/runningdinner/{adminId}/participant/{participantId}", method = RequestMethod.PUT)
	public ParticipantTO updateParticipant(@PathVariable("adminId") String dinnerAdminId,
			@PathVariable("participantId") UUID participantId, @Valid @RequestBody ParticipantTO participantTO, Locale locale) {

		Participant participant = participantTO.toParticipant();
		participant = participantService.updateParticipant(dinnerAdminId, participantId, participant);
		return new ParticipantTO(participant);
	}

	@RequestMapping(value = "/runningdinner/{adminId}/participant", method = RequestMethod.POST)
	public ParticipantTO createParticipant(@PathVariable("adminId") String adminId,
		                                     @Valid @RequestBody ParticipantTO participantTO, Locale locale) {

		Participant participant = participantTO.toParticipant();
		Participant createdParticipant = participantService.addParticipant(adminId, participant);
		return new ParticipantTO(createdParticipant);
	}

	@RequestMapping(value = "/runningdinner/{adminId}/participant/{participantId}", method = RequestMethod.DELETE)
	public void deleteParticipant(@PathVariable("adminId") String dinnerAdminId,
			                          @PathVariable("participantId") UUID participantId) {

		participantService.deleteParticipant(dinnerAdminId, participantId);
	}
	
	@RequestMapping(value = "/runningdinner/{adminId}/participant/{participantId}/team-partner-wish", method = RequestMethod.GET)
	public TeamPartnerWishTO getTeamPartnerWishInfo(@PathVariable("adminId") String dinnerAdminId,
	                                                @PathVariable("participantId") UUID participantId,
	                                                @RequestParam(name = "relevantState", required = false) List<TeamPartnerWishState> relevantStates) {
	  
	  Participant participant = participantService.findParticipantById(dinnerAdminId, participantId);
	  
	  Optional<TeamPartnerWish> result = teamPartnerWishService.calculateTeamPartnerWishInfo(participant, dinnerAdminId);
	  if (result.isPresent()) {
      return TeamPartnerWishTO.newFromTeamPartnerWish(result.get(), relevantStates);
	  }
	  return new TeamPartnerWishTO();
	}
}
