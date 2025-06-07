package org.runningdinner.admin.mail;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.GeneratedTeamsResult;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerCalculator;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.dinnerplan.StaticTemplateDinnerPlanGenerator;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.geocoder.request.GeocodeRequestEventPublisher;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.mail.formatter.MessageFormatterHelperService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.context.MessageSource;

public class DinnerRouteMessageFormatterTest {

  private static final Locale GERMAN = Locale.GERMAN;

  private DinnerRouteMessageFormatter formatter;

  private AfterPartyLocationService afterPartyLocationService;

  @Mock
  private UrlGenerator urlGenerator;

  @Mock
  private MessageSource messageSource;

  @Mock
  private LocalizationProviderService localizationProviderService;

  @Mock
  private MessageFormatterHelperService messageFormatterHelperService;

  @Mock
  private GeocodeRequestEventPublisher geocodeRequestEventPublisher;

  private final RunningDinnerCalculator runningDinnerCalculator = new RunningDinnerCalculator();

  @Mock
  private RunningDinnerService runningDinnerService;

	private AutoCloseable mockitoInstance;
	
  @BeforeEach
  public void setUp() {

		mockitoInstance = MockitoAnnotations.openMocks(this);

    setupLocalizationProviderServiceMock();

    Mockito.when(urlGenerator.constructPrivateDinnerRouteUrl(Mockito.any(), Mockito.any(), Mockito.any()))
        .thenReturn("SelfAdminId");
    Mockito.when(messageSource.getMessage(Mockito.any(), Mockito.any(), Mockito.any()))
        .thenReturn("N/A");

    this.afterPartyLocationService = new AfterPartyLocationService(runningDinnerService, geocodeRequestEventPublisher, localizationProviderService, messageSource);

    this.formatter = new DinnerRouteMessageFormatter(urlGenerator, messageSource, localizationProviderService, messageFormatterHelperService, afterPartyLocationService);
  }

	@AfterEach
	public void tearDown() throws Exception {
		mockitoInstance.close();
	}
	
	@Test
	public void mobileNumbersFormattedForBothTeamMembers() {
		
		RunningDinner runningDinner = newMockedRunningDinner();
		List<Team> teams = generateTeams(runningDinner);
		
		Team team = teams.get(0);
		List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(team);
		
		Team oneHostingTeam = findOtherHostingTeamInDinnerRoute(dinnerRoute, team);
		setMobileNumber(oneHostingTeam, "123456789", true);
		setMobileNumber(oneHostingTeam, "987654321", false);
		
		DinnerRouteMessage dinnerRouteMessageTemplate = newDinnerRouteMessage();
		
		String dinnerRouteMessage = formatter.formatDinnerRouteMessage(runningDinner, team.getHostTeamMember(), team, dinnerRoute, dinnerRouteMessageTemplate);
		assertThat(dinnerRouteMessage).contains("Kontakt: 123456789, 987654321");
		assertThat(dinnerRouteMessage).contains("Kontakt: N/A"); // The other team in dinner-route have no mobile numbers setup, hence we get this one always also
	}
	
	@Test
	public void mobileNumbersFormattedForOnlyHostTeamMember() {
		
		RunningDinner runningDinner = newMockedRunningDinner();
		List<Team> teams = generateTeams(runningDinner);
		
		Team team = teams.get(0);
		List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(team);
		
		Team oneHostingTeam = findOtherHostingTeamInDinnerRoute(dinnerRoute, team);
		setMobileNumber(oneHostingTeam, "123456789", true);
		
		DinnerRouteMessage dinnerRouteMessageTemplate = newDinnerRouteMessage();
		
		String dinnerRouteMessage = formatter.formatDinnerRouteMessage(runningDinner, team.getHostTeamMember(), team, dinnerRoute, dinnerRouteMessageTemplate);
		assertThat(dinnerRouteMessage).contains("Kontakt: 123456789");
		assertThat(dinnerRouteMessage).contains("Kontakt: N/A"); // The other team in dinner-route have no mobile numbers setup, hence we get this one always also
	}
	
	@Test
	public void mobileNumbersFormattedForPartnerTeamMemberWhenHostHasNone() {
		
		RunningDinner runningDinner = newMockedRunningDinner();
		List<Team> teams = generateTeams(runningDinner);
		
		Team team = teams.get(0);
		List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(team);
		
		Team oneHostingTeam = findOtherHostingTeamInDinnerRoute(dinnerRoute, team);
		setMobileNumber(oneHostingTeam, "123456789", false);
		
		DinnerRouteMessage dinnerRouteMessageTemplate = newDinnerRouteMessage();
		
		String dinnerRouteMessage = formatter.formatDinnerRouteMessage(runningDinner, team.getHostTeamMember(), team, dinnerRoute, dinnerRouteMessageTemplate);
		assertThat(dinnerRouteMessage).contains("Kontakt: 123456789");
		assertThat(dinnerRouteMessage).contains("Kontakt: N/A"); // The other team in dinner-route have no mobile numbers setup, hence we get this one always also
	}
	
	private void setMobileNumber(Team team, String mobileNumber, boolean setToHostingTeamMember) {
		
		List<Participant> teamMembers = team.getTeamMembersOrdered();
		Participant teamMember = teamMembers
															.stream()
															.filter(member -> setToHostingTeamMember == member.isHost())
															.findFirst()
															.orElseThrow(IllegalStateException::new);
		teamMember.setMobileNumber(mobileNumber);
	}

	private Team findOtherHostingTeamInDinnerRoute(List<Team> dinnerRoute, Team team) {
		
	  return dinnerRoute
	          .stream()
	          .filter(t -> !Objects.equals(t, team))
	          .findFirst()
	          .orElseThrow(IllegalStateException::new);
	}

	private DinnerRouteMessage newDinnerRouteMessage() {
		
		DinnerRouteMessage dinnerRouteTextMessage = new DinnerRouteMessage();
		dinnerRouteTextMessage.setSubject("Subject");
		dinnerRouteTextMessage.setMessage("{route}");
		dinnerRouteTextMessage.setHostsTemplate("Kontakt: {mobilenumber}");
		dinnerRouteTextMessage.setSelfTemplate("Self");
		dinnerRouteTextMessage.setTeamSelection(TeamSelection.ALL);
		return dinnerRouteTextMessage;
	}
	
	private RunningDinner newMockedRunningDinner() {
		
		RunningDinner result = new RunningDinner();
		result.setSelfAdministrationId(UUID.randomUUID());
		result.setConfiguration(Configurations.standardConfig);
		result.setRunningDinnerType(RunningDinnerType.STANDARD);
		return result;
	}
	
	private List<Team> generateTeams(RunningDinner runningDinner) {
		
		List<Participant> teamMembers = ParticipantGenerator.generateParticipants(18);
		try {
			RunningDinnerConfig runningDinnerConfig = runningDinner.getConfiguration();
			GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(runningDinnerConfig, teamMembers, Collections.emptyList(), Collections::shuffle);
			runningDinnerCalculator.assignRandomMealClasses(teamsResult, runningDinnerConfig, Collections.emptyList());
			StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teamsResult.getRegularTeams(), runningDinnerConfig);
			return teamsResult.getRegularTeams();
		} catch (NoPossibleRunningDinnerException e) {
			throw new TechnicalException(e);
		}
	}
	
	private void setupLocalizationProviderServiceMock() {
		
		Mockito.when(localizationProviderService.getUserLocale()).thenReturn(GERMAN);
		Mockito.when(localizationProviderService.getTimeFormatter()).thenReturn(DateTimeUtil.getTimeFormatter(GERMAN.getLanguage()));
	}
}
