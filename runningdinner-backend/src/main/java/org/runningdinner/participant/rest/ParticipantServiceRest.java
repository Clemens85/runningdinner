package org.runningdinner.participant.rest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.rest.RunningDinnerRelatedIdListTO;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRegistrationsAggregationService;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.ParticipantSwapNumbersService;
import org.runningdinner.participant.partnerwish.TeamPartnerWish;
import org.runningdinner.participant.partnerwish.TeamPartnerWishInvitationState;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfoList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/rest/participantservice/v1")
public class ParticipantServiceRest {

  @Autowired
  private ParticipantService participantService;

  @Autowired
  private ParticipantSwapNumbersService participantSwapNumbersService;
  
  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private TeamPartnerWishService teamPartnerWishService;

  @Autowired
  private ParticipantRegistrationsAggregationService participantRegistrationsAggregationService;

  @GetMapping(value = "/runningdinner/{adminId}/participants")
  public ParticipantListActive findActiveParticipantsList(@PathVariable final String adminId) {

    ParticipantListActive result = participantService.findActiveParticipantList(adminId);
    return result;
  }

  @GetMapping(value = "/runningdinner/{adminId}/participants/export", produces = {
      MediaType.APPLICATION_OCTET_STREAM_VALUE })
  public void exportParticipants(@PathVariable final String adminId, HttpServletResponse response) {

    String fileName = "participants-export.xlsx";

    response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");

    try {
      participantService.exportParticipantsAsExcel(adminId, response.getOutputStream());
    } catch (IOException e) {
      throw new TechnicalException(e);
    }
  }

  @GetMapping("/runningdinner/{adminId}/participants/{participantId}")
  public ParticipantTO findParticipant(@PathVariable final String adminId,
      @PathVariable final UUID participantId) {

    Participant participant = participantService.findParticipantById(adminId, participantId);
    return new ParticipantTO(participant);
  }

  @PutMapping("/runningdinner/{adminId}/participants/{participantId}/geocode")
  public ParticipantTO updateParticipantGeocode(@PathVariable final String adminId,
      @PathVariable final UUID participantId,
      @RequestBody GeocodingResult geocodingResult) {

    Participant participant = participantService.updateParticipantGeocode(adminId, participantId, geocodingResult);
    return participant != null ? new ParticipantTO(participant) : null; 
  }
  
  @PutMapping("/runningdinner/{adminId}/participant/{participantId}/activate")
  public ParticipantTO activateParticipantSubscription(@PathVariable final String adminId,
                                                       @PathVariable final UUID participantId) {

    LocalDateTime now = LocalDateTime.now();
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    Participant result = participantService.updateParticipantSubscription(participantId, now, false, runningDinner);
    return new ParticipantTO(result);
  }

  @PutMapping("/runningdinner/{adminId}/participant/{participantId}")
  public ParticipantTO updateParticipant(@PathVariable("adminId") String dinnerAdminId,
                                         @PathVariable UUID participantId,
                                         @Valid @RequestBody ParticipantInputDataTO participantTO) {

    Participant participant = participantService.updateParticipant(dinnerAdminId, participantId, participantTO);
    return new ParticipantTO(participant);
  }

  @PostMapping("/runningdinner/{adminId}/participant")
  public ParticipantTO createParticipant(@PathVariable String adminId,
                                         @Valid @RequestBody ParticipantInputDataTO participantTO) {

    Participant createdParticipant = participantService.addParticipant(adminId, participantTO);
    return new ParticipantTO(createdParticipant);
  }

  @DeleteMapping("/runningdinner/{adminId}/participant/{participantId}")
  public void deleteParticipant(@PathVariable("adminId") String dinnerAdminId,
      @PathVariable UUID participantId) {

    participantService.deleteParticipant(dinnerAdminId, participantId);
  }

  @GetMapping("/runningdinner/{adminId}/participant/{participantId}/team-partner-wish")
  public TeamPartnerWishTO getTeamPartnerWishInfo(@PathVariable("adminId") String dinnerAdminId,
      @PathVariable UUID participantId,
      @RequestParam(name = "relevantState", required = false) List<TeamPartnerWishInvitationState> relevantStates) {

    Participant participant = participantService.findParticipantById(dinnerAdminId, participantId);
    return calculateTeamPartnerWishInfo(dinnerAdminId, participant, relevantStates);
  }

  @PutMapping("/runningdinner/{adminId}/participants/team-partner-wish")
  public List<TeamPartnerWishTO> getTeamPartnerWishInfoList(@PathVariable("adminId") String dinnerAdminId,
      @Valid @RequestBody RunningDinnerRelatedIdListTO participantIdList,
      @RequestParam(name = "relevantState", required = false) List<TeamPartnerWishInvitationState> relevantStates) {

    List<TeamPartnerWishTO> result = new ArrayList<>();
    List<Participant> participants = participantService.findParticipantsByIds(dinnerAdminId,
        new HashSet<>(participantIdList.getEntityIds()));
    for (Participant participant : participants) {
      result.add(calculateTeamPartnerWishInfo(dinnerAdminId, participant, relevantStates));
    }
    return result;
  }

  @GetMapping("/runningdinner/{adminId}/participants/registrations")
  public ParticipantRegistrationInfoList getParticipantRegistrations(@PathVariable("adminId") String dinnerAdminId,
      @RequestParam(defaultValue = "0") int page) {

    return participantRegistrationsAggregationService.findParticipantRegistrations(dinnerAdminId, LocalDateTime.now(), page);
  }

  @PutMapping("/runningdinner/{adminId}/participants/swap/{firstParticipantId}/{secondParticipantId}")
  public void swapParticipantNumbers(@PathVariable("adminId") String dinnerAdminId, 
                                     @PathVariable UUID firstParticipantId, 
                                     @PathVariable UUID secondParticipantId) {

    participantSwapNumbersService.swapParticipantNumbers(dinnerAdminId, firstParticipantId, secondParticipantId);
  }
  
  private TeamPartnerWishTO calculateTeamPartnerWishInfo(String dinnerAdminId, Participant participant,
      List<TeamPartnerWishInvitationState> relevantStates) {
    Optional<TeamPartnerWish> result = teamPartnerWishService.calculateTeamPartnerWishInfo(participant,
        dinnerAdminId);
    if (result.isPresent()) {
      return TeamPartnerWishTO.newFromTeamPartnerWish(result.get(), relevantStates);
    }
    return TeamPartnerWishTO.newEmptyObject();
  }
}
