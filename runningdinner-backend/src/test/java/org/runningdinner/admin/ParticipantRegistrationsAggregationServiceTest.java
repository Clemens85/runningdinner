package org.runningdinner.admin;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRegistrationsAggregationService;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfo;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfoList;
import org.runningdinner.queue.QueueProviderFactoryService;
import org.runningdinner.queue.QueueProviderMockInMemory;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class ParticipantRegistrationsAggregationServiceTest {

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

  @Autowired
  private ParticipantRegistrationsAggregationService participantRegistrationsAggregationService;

  @Autowired
  private ParticipantService participantService;

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private QueueProviderFactoryService queueProviderFactoryService;

  @Autowired
  private CreateRunningDinnerWizardService createRunningDinnerWizardService;

  private RunningDinner runningDinner;
  private QueueProviderMockInMemory queueProvider;

  @Test
  public void findWithTeamPartnerRegistrations() {
    setUpRunningDinner(8);

    Participant teamPartnerRegistration = testHelperService.registerParticipantsAsFixedTeam(runningDinner, "Max Mustermann", "max@muster.de", "Maria Musterfrau");

    var latestRegistrations = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 0);
    assertThat(latestRegistrations.getRegistrations()).hasSize(9);
    assertThat(latestRegistrations.getNotActivatedRegistrationsTooOld()).isEmpty();

    var latestRegistration = latestRegistrations.getRegistrations().get(0);
    assertThat(latestRegistration.getId()).isEqualTo(teamPartnerRegistration.getId());
    assertThat(latestRegistration.getTeamPartnerWishChildInfo()).isEqualTo("Maria Musterfrau");

    assertThat(latestRegistrations.getRegistrations().get(1).getTeamPartnerWishOriginatorId()).isNull();
    assertThat(latestRegistrations.getRegistrations().get(1).getTeamPartnerWishChildInfo()).isNullOrEmpty();
  }

  @Test
  public void findWithTeamPartnerRegistrationsSplitIntoNextSlice() {
    setUpRunningDinner(0);

    var now = LocalDateTime.now();
    var singleParticipant = testHelperService.registerSingleParticipant(runningDinner, "Foo Bar", "foo@bar.de");

    Participant teamPartnerRegistration = testHelperService.registerParticipantsAsFixedTeam(runningDinner, "Max Mustermann", "max@muster.de", "Maria Musterfrau");

    var latestRegisteredParticipants = ParticipantGenerator.generateParticipants(17, 3);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, latestRegisteredParticipants);

    var registrationSlice = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), now, 0);
    assertThat(registrationSlice.getRegistrations()).hasSize(17);
    assertThat(registrationSlice.getNotActivatedRegistrationsTooOld()).isEmpty();
    assertThat(registrationSlice.isHasMore()).isTrue();
    var notFoundTeamPartnerRegistration = IdentifierUtil.filterListForId(registrationSlice.getRegistrations(), teamPartnerRegistration.getId());
    assertThat(notFoundTeamPartnerRegistration).isNotPresent();

    registrationSlice = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), now, 1);
    assertThat(registrationSlice.getRegistrations()).hasSize(2);

    var foundRegistrationForTeamPartnerRegistration = registrationSlice.getRegistrations().get(0);
    assertThat(foundRegistrationForTeamPartnerRegistration).isNotNull();
    assertThat(foundRegistrationForTeamPartnerRegistration.getId()).isEqualTo(teamPartnerRegistration.getId());
    assertThat(foundRegistrationForTeamPartnerRegistration.getTeamPartnerWishChildInfo()).isEqualTo("Maria Musterfrau");

    assertThat(registrationSlice.getRegistrations().get(1).getId()).isEqualTo(singleParticipant.getId());
  }


  @Test
  public void findParticipantRegistrationsAllActivated() {

    // We register 22 participants in setup and our page-size is 18
    setUpRunningDinner(22);

    ParticipantRegistrationInfoList latestRegistrations = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 0);

    assertThat(latestRegistrations.getRegistrations()).hasSize(ParticipantRegistrationsAggregationService.PARTICIPANT_PAGE_SIZE);
    assertThat(latestRegistrations.isHasMore()).isTrue();
    assertThat(latestRegistrations.getNotActivatedRegistrationsTooOld()).isEmpty();

    List<ParticipantRegistrationInfo> registrations = latestRegistrations.getRegistrations();
    for (int i = 0; i < ParticipantRegistrationsAggregationService.PARTICIPANT_PAGE_SIZE;  i++) {
      assertThat(registrations.get(i).getParticipantNumber()).isEqualTo(22 - i); // 22, 21, 20, ... (because we get latest registrations)
    }
  }

  @Test
  public void findParticipantRegistrationsSomeNotActivated() {

    setUpRunningDinner(22);

    List<Participant> allParticipants = participantService.findParticipants(runningDinner.getAdminId(), false);

    // We register 22 participants in setup and our page-size is 18

    Participant secondToLastRegistratedParticipant = removeActivation(allParticipants.get(20));
    Participant oldRegisteredParticipant = removeActivation(allParticipants.get(1));

    ParticipantRegistrationInfoList latestRegistrations = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 0);

    assertThat(latestRegistrations.getRegistrations()).hasSize(ParticipantRegistrationsAggregationService.PARTICIPANT_PAGE_SIZE);
    assertThat(latestRegistrations.isHasMore()).isTrue();

    List<ParticipantRegistrationInfo> registrations = latestRegistrations.getRegistrations();
    assertThat(registrations.get(0).getParticipantNumber()).isEqualTo(secondToLastRegistratedParticipant.getParticipantNumber());
    assertThat(registrations.get(1).getParticipantNumber()).isEqualTo(oldRegisteredParticipant.getParticipantNumber());
    assertThat(registrations.get(2).getParticipantNumber()).isEqualTo(22);
    assertThat(registrations.get(3).getParticipantNumber()).isEqualTo(20);
    assertThat(registrations.get(4).getParticipantNumber()).isEqualTo(19);
    assertThat(registrations.get(5).getParticipantNumber()).isEqualTo(18);
    // ... And so on

    assertThat(latestRegistrations.getNotActivatedRegistrationsTooOld()).isEmpty();

    latestRegistrations = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 1);
    assertThat(latestRegistrations.getRegistrations()).hasSize(4);
    assertThat(latestRegistrations.isHasMore()).isFalse();

    // The one with number 2 was already in first page, so it should not occur here
    registrations = latestRegistrations.getRegistrations();
    assertThat(registrations.get(0).getParticipantNumber()).isEqualTo(5);
    assertThat(registrations.get(1).getParticipantNumber()).isEqualTo(4);
    assertThat(registrations.get(2).getParticipantNumber()).isEqualTo(3);
    assertThat(registrations.get(3).getParticipantNumber()).isEqualTo(1);
  }


  @Test
  public void findParticipantRegistrationsSomeNotActivatedSinceSeveralDays() {

    setUpRunningDinner(22);

    List<Participant> allParticipants = participantService.findParticipants(runningDinner.getAdminId(), false);

    // We register 22 participants in setup and our page-size is 18

    Participant secondToLastRegistratedParticipant = removeActivation(allParticipants.get(20));
    Participant oldRegisteredParticipant = removeActivation(allParticipants.get(1));

    LocalDateTime now = LocalDateTime.now().plusDays(3);

    ParticipantRegistrationInfoList latestRegistrations = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), now, 0);
    assertThat(latestRegistrations.getRegistrations()).hasSize(ParticipantRegistrationsAggregationService.PARTICIPANT_PAGE_SIZE);
    assertThat(latestRegistrations.isHasMore()).isTrue();

    List<ParticipantRegistrationInfo> registrations = latestRegistrations.getRegistrations();
    assertThat(registrations.get(0).getParticipantNumber()).isEqualTo(secondToLastRegistratedParticipant.getParticipantNumber());
    assertThat(registrations.get(1).getParticipantNumber()).isEqualTo(oldRegisteredParticipant.getParticipantNumber());
    assertThat(registrations.get(2).getParticipantNumber()).isEqualTo(22);
    // ... and so on

    List<ParticipantRegistrationInfo> registrationsTooOld = latestRegistrations.getNotActivatedRegistrationsTooOld();
    assertThat(registrationsTooOld).hasSize(2);
    // Test also here that projection is properly mapped:
    ParticipantRegistrationInfo oldRegisteredParticipantInfo = registrationsTooOld.get(1);
    assertThat(oldRegisteredParticipantInfo.getId()).isEqualTo(oldRegisteredParticipant.getId());
    assertThat(oldRegisteredParticipantInfo.getEmail()).isEqualTo(oldRegisteredParticipant.getEmail());
    assertThat(oldRegisteredParticipantInfo.getActivationDate()).isNull();
    assertThat(oldRegisteredParticipantInfo.getCreatedAt()).isEqualTo(oldRegisteredParticipant.getCreatedAt());
    assertThat(oldRegisteredParticipantInfo.getFirstnamePart()).isEqualTo(oldRegisteredParticipant.getName().getFirstnamePart());
    assertThat(oldRegisteredParticipantInfo.getLastname()).isEqualTo(oldRegisteredParticipant.getName().getLastname());
    assertThat(oldRegisteredParticipantInfo.getMobileNumber()).isEqualTo(oldRegisteredParticipant.getMobileNumber());
    assertThat(oldRegisteredParticipantInfo.getParticipantNumber()).isEqualTo(2);
  }

  private void setUpRunningDinner(int numberOfParticipants) {

    this.runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(DINNER_DATE, numberOfParticipants);
    this.queueProvider = (QueueProviderMockInMemory) queueProviderFactoryService.getQueueProvider();
    this.queueProvider.clearMessageRequests();
  }

  private Participant removeActivation(Participant participant) {
    participant.setActivationDate(null);
    participant.setActivatedBy(null);
    List<Participant> result = testHelperService.saveParticipants(Collections.singletonList(participant));
    return result.get(0);
  }
}
