package org.runningdinner.admin.message.proposal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class MessageProposalServiceTest {

  private static final String ADMIN_ID = "test-admin-id";

  private ProposalRepository proposalRepository;
  private RunningDinnerService runningDinnerService;
  private MessageProposalService messageProposalService;

  @BeforeEach
  void setUp() {
    proposalRepository = mock(ProposalRepository.class);
    runningDinnerService = mock(RunningDinnerService.class);
    messageProposalService = new MessageProposalService(proposalRepository, runningDinnerService);
  }

  @Test
  void returnsEmptyWhenNoFileExists() {
    givenRelevantRunningDinner();
    String expectedPath = MessageProposalService.MESSAGES_GENERATED_PREFIX + "/DINNER_ROUTE/" + ADMIN_ID + ".md";
    when(proposalRepository.findProposalByStoragePath(expectedPath)).thenReturn(Optional.empty());

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.DINNER_ROUTE);

    assertThat(result).isEmpty();
  }

  @Test
  void returnsEmptyWhenRunningDinnerIsNotRelevant() {
    RunningDinner closedDinner = new RunningDinner();
    closedDinner.setRegistrationType(RegistrationType.CLOSED);
    when(runningDinnerService.findRunningDinnerByAdminId(ADMIN_ID)).thenReturn(closedDinner);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isEmpty();
  }

  @Test
  void returnsEmptyWhenRunningDinnerFetchFails() {
    when(runningDinnerService.findRunningDinnerByAdminId(ADMIN_ID)).thenThrow(new RuntimeException("Not found"));

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isEmpty();
  }

  @Test
  void parsesSubjectAndMessageTemplateFromSimpleProposal() {
    givenRelevantRunningDinner();
    String content = """
        ## Subject
        Welcome to the Running Dinner!

        ## MESSAGE TEMPLATE
        Dear {firstname}, here are your dinner details.
        """;
    givenProposalContent(MessageType.PARTICIPANT, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isPresent();
    assertThat(result.get().subject()).isEqualTo("Welcome to the Running Dinner!");
    assertThat(result.get().messageTemplate()).isEqualTo("Dear {firstname}, here are your dinner details.");
    assertThat(result.get().additionalSections()).isEmpty();
  }

  @Test
  void parsesAdditionalSectionsFromDinnerRouteProposal() {
    givenRelevantRunningDinner();
    String content = """
        ## Subject
        Your Dinner Route

        ## Message Template
        Here is your route: {route}

        ## Hosts Template
        Your hosts are: {hosts}

        ## Self Template
        You are hosting this course.
        """;
    givenProposalContent(MessageType.DINNER_ROUTE, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.DINNER_ROUTE);

    assertThat(result).isPresent();
    MessageProposalTO proposal = result.get();
    assertThat(proposal.subject()).isEqualTo("Your Dinner Route");
    assertThat(proposal.messageTemplate()).isEqualTo("Here is your route: {route}");
    assertThat(proposal.additionalSections()).containsKey("HOSTS TEMPLATE");
    assertThat(proposal.additionalSections().get("HOSTS TEMPLATE")).isEqualTo("Your hosts are: {hosts}");
    assertThat(proposal.additionalSections()).containsKey("SELF TEMPLATE");
    assertThat(proposal.additionalSections().get("SELF TEMPLATE")).isEqualTo("You are hosting this course.");
  }

  @Test
  void parsesAdditionalSectionsFromTeamProposal() {
    givenRelevantRunningDinner();
    String content = """
        ## Subject
        Team Arrangements

        ## Message Template
        Dear {firstname}, here are your team arrangements.

        ## Host Template
        You are hosting at {meal}.

        ## Non Host Template
        You are a guest at {meal}.
        """;
    givenProposalContent(MessageType.TEAM, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.TEAM);

    assertThat(result).isPresent();
    MessageProposalTO proposal = result.get();
    assertThat(proposal.subject()).isEqualTo("Team Arrangements");
    assertThat(proposal.messageTemplate()).isEqualTo("Dear {firstname}, here are your team arrangements.");
    assertThat(proposal.additionalSections()).containsEntry("HOST TEMPLATE", "You are hosting at {meal}.");
    assertThat(proposal.additionalSections()).containsEntry("NON HOST TEMPLATE", "You are a guest at {meal}.");
  }

  @Test
  void returnsEmptyWhenSubjectSectionIsMissing() {
    givenRelevantRunningDinner();
    String content = """
        ## Message Template
        Some content without a subject.
        """;
    givenProposalContent(MessageType.PARTICIPANT, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isEmpty();
  }

  @Test
  void returnsEmptyWhenMessageTemplateSectionIsMissing() {
    givenRelevantRunningDinner();
    String content = """
        ## Subject
        Some subject without a message template.
        """;
    givenProposalContent(MessageType.PARTICIPANT, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isEmpty();
  }

  @Test
  void sectionMatchingIsCaseInsensitive() {
    givenRelevantRunningDinner();
    String content = """
        ## subject
        Case Insensitive Subject

        ## message template
        Case insensitive content.
        """;
    givenProposalContent(MessageType.PARTICIPANT, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isPresent();
    assertThat(result.get().subject()).isEqualTo("Case Insensitive Subject");
    assertThat(result.get().messageTemplate()).isEqualTo("Case insensitive content.");
  }

  @Test
  void preservesMultilineContentWithinSections() {
    givenRelevantRunningDinner();
    String content = """
        ## Subject
        Multi Line Subject

        ## Message Template
        Line one of the template.
        Line two of the template.
        Line three of the template.
        """;
    givenProposalContent(MessageType.PARTICIPANT, content);

    Optional<MessageProposalTO> result = messageProposalService.findMessageProposal(ADMIN_ID, MessageType.PARTICIPANT);

    assertThat(result).isPresent();
    assertThat(result.get().messageTemplate()).contains("Line one of the template.");
    assertThat(result.get().messageTemplate()).contains("Line two of the template.");
    assertThat(result.get().messageTemplate()).contains("Line three of the template.");
  }

  @Test
  void buildsCorrectStoragePathForEachMessageType() {
    givenRelevantRunningDinner();
    for (MessageType messageType : new MessageType[]{MessageType.PARTICIPANT, MessageType.TEAM, MessageType.DINNER_ROUTE}) {
      String expectedPath = MessageProposalService.MESSAGES_GENERATED_PREFIX + "/" + messageType.name() + "/" + ADMIN_ID + ".md";
      when(proposalRepository.findProposalByStoragePath(expectedPath)).thenReturn(Optional.empty());

      messageProposalService.findMessageProposal(ADMIN_ID, messageType);

      verify(proposalRepository).findProposalByStoragePath(expectedPath);
    }
  }

  private void givenRelevantRunningDinner() {
    RunningDinner runningDinner = new RunningDinner();
    when(runningDinnerService.findRunningDinnerByAdminId(ADMIN_ID)).thenReturn(runningDinner);
  }

  private void givenProposalContent(MessageType messageType, String content) {
    String path = MessageProposalService.MESSAGES_GENERATED_PREFIX + "/" + messageType.name() + "/" + ADMIN_ID + ".md";
    when(proposalRepository.findProposalByStoragePath(path)).thenReturn(Optional.of(new ProposalExample(path, content)));
  }
}
