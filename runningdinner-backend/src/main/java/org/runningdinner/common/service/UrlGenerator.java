
package org.runningdinner.common.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class UrlGenerator {

  private static final String PARTICIPANT_ID_URL_PLACEHOLDER = "\\{participantId\\}";
  private static final String ADMIN_DINNER_ID_URL_PLACEHOLDER = "adminId";
  private static final String PUBLIC_DINNER_ID_URL_PLACEHOLDER = "publicId";
  private static final String SELF_ADMINISTRATION_ID_URL_PLACEHOLDER = "selfAdministrationId";

  @Value("${dinner.public.url}")
  private String publicDinnerUrlTemplate;
  
  @Value("${dinner.public.registration.url}")
  private String publicDinnerRegistrationUrlTemplate;

  @Value("${dinner.admin.url}")
  private String dinnerAdminUrlTemplate;

  @Value("${dinner.team.managehost.url}")
  private String teamManageHostUrlTemplate;

  @Value("${dinner.teampartnerwish.confirmation.url}")
  private String teamPartnerWishConfirmationUrlTemplate;
  
  @Value("${dinner.team.route.url}")
  private String teamRouteUrlTemplate;
  
  @Value("${dinner.admin.participants.url}")
  private String adminParticipantsUrl;
  

  /**
   * Builds a valid URL for administrating the running dinner identified by the passed uuid.<br>
   * Typically the URL is constructed out of a configured property which identifies host on which this app is running. If this property
   * does not exist then it is tried to construct the host out of the passed request.
   * 
   * @param adminId
   * @param request (Optional) Used when there is no configured host property for constructing the resulting URL
   * @return
   */
  public String constructAdministrationUrl(String adminId) {

    Assert.hasText(dinnerAdminUrlTemplate, "Dinner Admin URL Template is not configured!");
    Assert.hasText(adminId, "adminId");

    String result = dinnerAdminUrlTemplate.replaceAll("\\{" + ADMIN_DINNER_ID_URL_PLACEHOLDER + "\\}", adminId);
    return result;
  }

  public String constructPublicDinnerUrl(String publicId) {

    return replacePublicDinnerIdInUrl(publicDinnerUrlTemplate, publicId);
  }
  
  public String constructPublicDinnerRegistrationUrl(String publicId, String invitingParticipantEmail, String prefilledEmailAddress) {

    String result = replacePublicDinnerIdInUrl(publicDinnerRegistrationUrlTemplate, publicId);
    if (StringUtils.isEmpty(invitingParticipantEmail)) {
      return result;
    }
    if (StringUtils.contains(result, "?")) {
      result += "&invitingParticipantEmail=";
    } else {
      result += "?invitingParticipantEmail=";
    }
    result += urlEncode(invitingParticipantEmail);
    
    result += "&prefilledEmailAddress=";
    result += urlEncode(prefilledEmailAddress);
    
    return result;
  }
  
  public String constructPublicDinnerRegistrationOrderCallbackUrl(String publicId, String callbackUrlType) {
    
    String result = replacePublicDinnerIdInUrl(publicDinnerRegistrationUrlTemplate, publicId);
    Assert.state(StringUtils.isNotBlank(callbackUrlType), "callbackUrlType must not be empty");
    
    if (StringUtils.contains(result, "?")) {
      result += "&callbackUrlType=" + callbackUrlType;
    } else {
      result += "?callbackUrlType=" + callbackUrlType;
    }
    return result; 
  }

  
  private String replacePublicDinnerIdInUrl(String urlTemplate, String publicId) {
    
    Assert.hasText(urlTemplate, "Dinner Public URL Template is not configured!");
    Assert.hasText(publicId, "publicId");

    String result = urlTemplate.replaceAll("\\{" + PUBLIC_DINNER_ID_URL_PLACEHOLDER + "\\}", publicId);
    return result;
  }
  
  public RunningDinner addPublicDinnerUrl(RunningDinner runningDinner) {
    
    if (runningDinner.getPublicSettings() != null && StringUtils.isNotEmpty(runningDinner.getPublicSettings().getPublicId())) {
      String publicDinnerUrl = constructPublicDinnerUrl(runningDinner.getPublicSettings().getPublicId());
      runningDinner.getPublicSettings().setPublicDinnerUrl(publicDinnerUrl);
    }
    return runningDinner;
  }
  
  public List<RunningDinner> addPublicDinnerUrl(List<RunningDinner> runningDinners) {
    
    return runningDinners
            .stream()
            .map(this::addPublicDinnerUrl)
            .collect(Collectors.toList());
  }
  
  public String constructParticipantActivationUrl(String publicId, UUID participantId) {

    Assert.hasText(publicDinnerUrlTemplate, "Dinner Public URL Template is not configured!");
    Assert.hasText(publicId, "publicId");
    Assert.notNull(participantId, "participantId");
    
    String result = publicDinnerUrlTemplate.replaceAll("\\{" + PUBLIC_DINNER_ID_URL_PLACEHOLDER + "\\}", publicId);
    if (result.endsWith("/")) {
      result = StringUtils.chop(result);
    }
    result += "/" + participantId.toString() + "/activate";
    return result;
  }

  public String constructAdministrationAcknowledgeUrl(RunningDinner runningDinner) {
    
    String result = constructAdministrationUrl(runningDinner.getAdminId());
    if (result.endsWith("/")) {
      result = StringUtils.chop(result);
    }
    result += "/" + runningDinner.getObjectId().toString() + "/acknowledge";
    return result;
  }
  
  public String constructPrivateDinnerRouteUrl(UUID selfAdministrationId, UUID teamId, UUID participantId) {

    Assert.hasText(teamRouteUrlTemplate, "Team Route URL Template is not configured!");
    String result = internalConstructSelfAdministrationUrl(teamRouteUrlTemplate, selfAdministrationId);
    return internalConstructPrivateTeamUrl(result, teamId, participantId);
  }

  public String constructManageTeamHostUrl(UUID selfAdministrationId, UUID teamId, UUID participantId) {

    Assert.hasText(teamManageHostUrlTemplate, "Team Manage URL Template is not configured!");
    String result = internalConstructSelfAdministrationUrl(teamManageHostUrlTemplate, selfAdministrationId);
    return internalConstructPrivateTeamUrl(result, teamId, participantId);
  }
  
  public String constructTeamPartnerWishConfirmationUrl(UUID selfAdministrationId, Participant participant, String teamPartnerEmailToConfirm) {
    
    Assert.hasText(teamPartnerWishConfirmationUrlTemplate, "Team Partner Wish Confirmation URL Template is not configured!");
    String result = internalConstructSelfAdministrationUrl(teamPartnerWishConfirmationUrlTemplate, selfAdministrationId);
    
    result = result.replaceAll(PARTICIPANT_ID_URL_PLACEHOLDER, participant.getId().toString());
    result = result.replaceAll(FormatterUtil.EMAIL, urlEncode(teamPartnerEmailToConfirm));
    return result;
  }
  
  public String constructAdminParticipantsUrl(String adminId) {
    
    Assert.hasText(adminParticipantsUrl, "Dinner Admin Participants URL Template is not configured!");
    Assert.hasText(adminId, "adminId");

    String result = adminParticipantsUrl.replaceAll("\\{" + ADMIN_DINNER_ID_URL_PLACEHOLDER + "\\}", adminId);
    return result;
  }

  private String internalConstructSelfAdministrationUrl(String urlTemplate, UUID selfAdministrationId) {
    
    String result = urlTemplate.replaceAll("\\{" + SELF_ADMINISTRATION_ID_URL_PLACEHOLDER + "\\}", selfAdministrationId.toString());
    return result;
  }
  
  private String internalConstructPrivateTeamUrl(String urlTemplate, UUID teamId, final UUID participantId) {

    Assert.notNull(teamId, "Passed teamId must not be empty!");
    Assert.notNull(participantId, "Passed participantId must not be empty!");

    String result = urlTemplate.replaceFirst("\\{teamId\\}", teamId.toString()).replaceFirst(PARTICIPANT_ID_URL_PLACEHOLDER, participantId.toString());
    return result;
  }
  
  private static String urlEncode(String input) {
    
    try {
      return URLEncoder.encode(input, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      throw new TechnicalException(e);
    }
  }

}
