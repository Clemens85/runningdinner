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

import javax.validation.Valid;
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
  public List<ParticipantWithListNumberTO> findParticipantRecipients(@PathVariable("adminId") String adminId) {
    return messageService.findParticipantRecipients(adminId);
  }

  @RequestMapping(value = "/runningdinner/{adminId}/mails/participant/preview", method = RequestMethod.PUT)
  @ResponseBody
  public PreviewMessageList getParticipantMailPreview(@PathVariable("adminId") String adminId,
                                                      @RequestBody @Valid ParticipantMessage participantMessage) {

    List<PreviewMessage> previewMessages = messageService.getParticipantMailPreview(adminId, participantMessage);
    return mapToPreviewMessageList(participantMessage, previewMessages);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/mails/participant", method = RequestMethod.PUT)
  public MessageJob sendParticipantMails(@PathVariable("adminId") String adminId, 
                                         @RequestParam(name="sendToDinnerOwner", required=false, defaultValue="false") boolean sendToDinnerOwner, 
                                         @RequestBody @Valid ParticipantMessage participantMessage) {

    MessageJob messageJob;
    if (!sendToDinnerOwner) {
      messageJob = messageService.sendParticipantMessages(adminId, participantMessage);
    } else {
      messageJob = messageService.sendParticipantMessagesSelf(adminId, participantMessage);
    }

    return messageJob;
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/mails/team/preview", method = RequestMethod.PUT)
  @ResponseBody
  public PreviewMessageList getTeamMailPreview(@PathVariable("adminId") String adminId,
                                               @RequestBody @Valid TeamMessage teamMessage) {

    List<PreviewMessage> previewMessages = messageService.getTeamPreview(adminId, teamMessage);
    return mapToPreviewMessageList(teamMessage, previewMessages);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/mails/team", method = RequestMethod.PUT)
  public MessageJob sendTeamArrangementMails(@PathVariable("adminId") String adminId,
                                             @RequestParam(name="sendToDinnerOwner", required=false, defaultValue="false") boolean sendToDinnerOwner,
                                             @RequestBody @Valid TeamMessage teamMessage) {

    MessageJob messageJob;
    if (!sendToDinnerOwner) {
      messageJob = messageService.sendTeamMessages(adminId, teamMessage);
    } else {
      messageJob = messageService.sendTeamMessagesSelf(adminId, teamMessage);
    }
    return messageJob;
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/mails/dinnerroute/preview", method = RequestMethod.PUT)
  @ResponseBody
  public PreviewMessageList getDinnerRouteMailPreview(@PathVariable("adminId") String adminId,
                                                      @RequestBody @Valid DinnerRouteMessage dinnerRouteMessage) {

    List<PreviewMessage> previewMessages = messageService.getDinnerRoutePreview(adminId, dinnerRouteMessage);
    return mapToPreviewMessageList(dinnerRouteMessage, previewMessages);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/mails/dinnerroute", method = RequestMethod.PUT)
  public MessageJob sendDinnerRouteMails(@PathVariable("adminId") String adminId, 
                                         @RequestParam(name="sendToDinnerOwner", required=false, defaultValue="false") boolean sendToDinnerOwner,
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
  public List<MessageJob> findMessageJobs(@PathVariable(value = "adminId") String adminId, 
                                          @RequestParam(value = "messageType", required = false) MessageType messageType) {
    
    return messageService.findMessageJobs(adminId, messageType);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagejobs/{messageJobId}")
  @ResponseBody
  public MessageJob findMessageJob(@PathVariable(value = "adminId") String adminId, 
                                   @PathVariable(value = "messageJobId") UUID messageJobId) {
    
    return messageService.findMessageJob(adminId, messageJobId);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagetasks/{messageJobId}")
  @ResponseBody
  public List<MessageTask> findMessageTasks(@PathVariable(value = "adminId") String adminId, 
                                            @PathVariable(value = "messageJobId") UUID messageJobId) {
    
    List<MessageTask> result = messageService.findMessageTasks(adminId, messageJobId);
    return result;
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagetask/{messageTaskId}", method = RequestMethod.PUT)
  @ResponseBody
  public MessageTask reSendMessageTask(@PathVariable(value = "adminId") String adminId,
                                       @PathVariable(value = "messageTaskId") UUID messageTaskId,
                                       @RequestBody @Valid MessageTask messageTask) {
    
    return messageService.reSendMessageTask(adminId, messageTaskId, messageTask);
  }
  
  @RequestMapping("/runningdinner/{adminId}/messagejobs/{messageJobId}/overview")
  @ResponseBody
  public MessageJobOverview findMessageJobOverview(@PathVariable(value = "adminId") String adminId, 
                                                   @PathVariable(value = "messageJobId") UUID messageJobId) {
    
    return messageService.findMessageJobOverview(adminId, messageJobId);
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/mails/teampartnerwish/{participantId}", method = RequestMethod.PUT)
  @ResponseBody
  public MessageJob sendTeamPartnerWishInvitation(@PathVariable(value = "adminId") String adminId,
                                                  @PathVariable(value = "participantId") UUID participantId) {
    
    
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
