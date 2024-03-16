package org.runningdinner.admin.message.rest;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.PreviewMessage;
import org.runningdinner.admin.message.PreviewMessageList;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageJobOverview;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.runningdinner.mail.formatter.SimpleTextMessage;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishStateHandlerService;
import org.runningdinner.participant.rest.ParticipantWithListNumberTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/rest/messageservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class MessageServiceRest {

  @Autowired
  private MessageService messageService;
  
  @Autowired
  private TeamPartnerWishStateHandlerService teamPartnerWishStateHandlerService;
  
  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private ParticipantService participantService;

  @GetMapping("/runningdinner/{adminId}/participants")
  public List<ParticipantWithListNumberTO> findParticipantRecipients(@PathVariable String adminId) {
    return messageService.findParticipantRecipients(adminId);
  }

  @PutMapping("/runningdinner/{adminId}/mails/participant/preview")
  @ResponseBody
  public PreviewMessageList getParticipantMailPreview(@PathVariable String adminId,
                                                      @RequestBody @Valid ParticipantMessage participantMessage) {

    List<PreviewMessage> previewMessages = messageService.getParticipantMailPreview(adminId, participantMessage);
    return mapToPreviewMessageList(participantMessage, previewMessages);
  }
  
  @PutMapping("/runningdinner/{adminId}/mails/participant")
  public MessageJob sendParticipantMails(@PathVariable String adminId, 
                                         @RequestParam(required=false, defaultValue="false") boolean sendToDinnerOwner, 
                                         @RequestBody @Valid ParticipantMessage participantMessage) {

    MessageJob messageJob;
    if (!sendToDinnerOwner) {
      messageJob = messageService.sendParticipantMessages(adminId, participantMessage);
    } else {
      messageJob = messageService.sendParticipantMessagesSelf(adminId, participantMessage);
    }

    return messageJob;
  }
  
  @PutMapping("/runningdinner/{adminId}/mails/team/preview")
  @ResponseBody
  public PreviewMessageList getTeamMailPreview(@PathVariable String adminId,
                                               @RequestBody @Valid TeamMessage teamMessage) {

    List<PreviewMessage> previewMessages = messageService.getTeamPreview(adminId, teamMessage);
    return mapToPreviewMessageList(teamMessage, previewMessages);
  }
  
  @PutMapping("/runningdinner/{adminId}/mails/team")
  public MessageJob sendTeamArrangementMails(@PathVariable String adminId,
                                             @RequestParam(required=false, defaultValue="false") boolean sendToDinnerOwner,
                                             @RequestBody @Valid TeamMessage teamMessage) {

    MessageJob messageJob;
    if (!sendToDinnerOwner) {
      messageJob = messageService.sendTeamMessages(adminId, teamMessage);
    } else {
      messageJob = messageService.sendTeamMessagesSelf(adminId, teamMessage);
    }
    return messageJob;
  }
  
  @PutMapping("/runningdinner/{adminId}/mails/dinnerroute/preview")
  @ResponseBody
  public PreviewMessageList getDinnerRouteMailPreview(@PathVariable String adminId,
                                                      @RequestBody @Valid DinnerRouteMessage dinnerRouteMessage) {

    List<PreviewMessage> previewMessages = messageService.getDinnerRoutePreview(adminId, dinnerRouteMessage);
    return mapToPreviewMessageList(dinnerRouteMessage, previewMessages);
  }
  
  @PutMapping("/runningdinner/{adminId}/mails/dinnerroute")
  public MessageJob sendDinnerRouteMails(@PathVariable String adminId, 
                                         @RequestParam(required=false, defaultValue="false") boolean sendToDinnerOwner,
                                         @RequestBody @Valid DinnerRouteMessage dinnerRouteMessage) {

    MessageJob messageJob;
    if (!sendToDinnerOwner) {
      messageJob = messageService.sendDinnerRouteMessages(adminId, dinnerRouteMessage);
    } else {
      messageJob = messageService.sendDinnerRouteMessagesSelf(adminId, dinnerRouteMessage);
    }
    return messageJob;
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagejobs")
  @ResponseBody
  public List<MessageJob> findMessageJobs(@PathVariable String adminId, 
                                          @RequestParam(required = false) MessageType messageType) {
    
    return messageService.findMessageJobs(adminId, messageType);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagejobs/{messageJobId}")
  @ResponseBody
  public MessageJob findMessageJob(@PathVariable String adminId, 
                                   @PathVariable UUID messageJobId) {
    
    return messageService.findMessageJob(adminId, messageJobId);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagetasks/{messageJobId}")
  @ResponseBody
  public List<MessageTask> findMessageTasks(@PathVariable String adminId, 
                                            @PathVariable UUID messageJobId) {
    
    List<MessageTask> result = messageService.findMessageTasks(adminId, messageJobId);
    return result;
  }
  
  @PutMapping("/runningdinner/{adminId}/messagetask/{messageTaskId}")
  @ResponseBody
  public MessageTask reSendMessageTask(@PathVariable String adminId,
                                       @PathVariable UUID messageTaskId,
                                       @RequestBody @Valid MessageTask messageTask) {
    
    return messageService.reSendMessageTask(adminId, messageTaskId, messageTask);
  }
  
  @RequestMapping("/runningdinner/{adminId}/messagejobs/{messageJobId}/overview")
  @ResponseBody
  public MessageJobOverview findMessageJobOverview(@PathVariable String adminId, 
                                                   @PathVariable UUID messageJobId) {
    
    return messageService.findMessageJobOverview(adminId, messageJobId);
  }
  
  @PutMapping("/runningdinner/{adminId}/mails/teampartnerwish/{participantId}")
  @ResponseBody
  public MessageJob sendTeamPartnerWishInvitation(@PathVariable String adminId,
                                                  @PathVariable UUID participantId) {
    
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    Participant participant = participantService.findParticipantById(adminId, participantId);
    return teamPartnerWishStateHandlerService.sendTeamPartnerInvitationMessage(participant, runningDinner);
  }
  
  protected PreviewMessageList mapToPreviewMessageList(SimpleTextMessage originalTextMessage, List<PreviewMessage> previewMessages) {
    
    previewMessages.forEach(
      pm -> pm.setMessage(FormatterUtil.getHtmlFormattedMessage(pm.getMessage()))
    );
    
    PreviewMessageList result = PreviewMessageList.createPreviewMessageList(previewMessages);
    result.setSubject(originalTextMessage.getSubject());
    return result;
  }
}
