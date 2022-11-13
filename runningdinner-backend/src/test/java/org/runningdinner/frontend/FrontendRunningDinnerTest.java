
package org.runningdinner.frontend;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.BasicSettingsTO;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.exception.DinnerNotFoundException;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.rest.RegistrationDataV2TO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.runningdinner.wizard.BasicDetailsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class FrontendRunningDinnerTest {

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private TestHelperService testHelperService;

  private LocalDate todayIn30Days;
  private RunningDinner runningDinner;
  private String publicDinnerId;

  @Before
  public void setUp() {

    todayIn30Days = LocalDate.now().plusDays(30);
    runningDinner = testHelperService.createPublicRunningDinner(todayIn30Days, 2);
    publicDinnerId = runningDinner.getPublicSettings().getPublicId();
  }

  @Test
  public void testFindRunningDinnerByPublicId() {

    RunningDinner foundRunningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(runningDinner.getPublicSettings().getPublicId(), LocalDate.now());
    assertThat(foundRunningDinner).isNotNull();
    assertThat(foundRunningDinner.getPublicSettings().getPublicId()).isEqualTo(runningDinner.getPublicSettings().getPublicId());
  }
  
  @Test(expected = DinnerNotFoundException.class)
  public void testFindRunningDinnerByPublicIdFailsForClosedRegistration() {

    BasicSettingsTO basicSettings = TestUtil.newBasicSettings(new BasicDetailsTO(runningDinner));
    basicSettings.getBasicDetails().setRegistrationType(RegistrationType.CLOSED);
    
    runningDinnerService.updateBasicSettings(runningDinner.getAdminId(), basicSettings);
    
    frontendRunningDinnerService.findRunningDinnerByPublicId(runningDinner.getPublicSettings().getPublicId(), LocalDate.now());
  }

  @Test
  public void testRegistrationValidationSuccessful() {

    RegistrationDataV2TO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de",
      ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);

    RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, true);
    assertThat(result).isNotNull();
  }

  @Test
  public void testRegistrationInvalidName() {

	  RegistrationDataV2TO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de",
	  ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);

	  registrationData.setFirstnamePart(null);
	  registrationData.setLastname("Mustermann");
	  
    try {
      frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, true);
      Assert.fail("Expected ValidationException to be thrown");
    } catch (IllegalArgumentException expectedEx) {
    	// NOP
//      assertThat(expectedEx.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.FULLNAME_NOT_VALID);
    }
  }

  @Test
  public void testRegistrationInvalidRegistrationDate() {

    // set end of registration date back to day before yesterday
    LocalDate tomorrow = LocalDate.now().plusDays(1);
    runningDinner = testHelperService.createPublicRunningDinner(tomorrow, 2);

    RegistrationDataV2TO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de",
      ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);

    try {
      frontendRunningDinnerService.performRegistration(runningDinner.getPublicSettings().getPublicId(), registrationData, true);
      Assert.fail("Expected ValidationException to be thrown");
    } catch (ValidationException expectedEx) {
      assertThat(expectedEx.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.REGISTRATION_DATE_EXPIRED);
    }
  }

  @Test
  public void testRegistrationSuccess() {

	RegistrationDataV2TO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de",
			ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
	RegistrationSummary firstParticipant = frontendRunningDinnerService.performRegistration(publicDinnerId,
			registrationData, false);
	checkRegistrationSummary(firstParticipant, 1);

    registrationData = TestUtil.createRegistrationData("Maria Musterfrau", "maria@muster.de",
      ParticipantAddress.parseFromCommaSeparatedString("Musterweg 10, 47112 Musterstadt"), 2);
    RegistrationSummary secondParticipant = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
    checkRegistrationSummary(secondParticipant, 2);

    registrationData = TestUtil.createRegistrationData("Third Participant", "third@muster.de",
      ParticipantAddress.parseFromCommaSeparatedString("Musterweg 10, 47112 Musterstadt"), 2);
    RegistrationSummary thirdParticipant = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
    checkRegistrationSummary(thirdParticipant, 3);
  }

  protected void checkRegistrationSummary(RegistrationSummary registrationSummary, int expectedParticipantNumber) {

    Participant participant = registrationSummary.getParticipant();
    assertThat(participant).isNotNull();
    assertThat(participant.getParticipantNumber()).isEqualTo(expectedParticipantNumber);
    assertThat(participant.isNew()).isFalse();
  }

  @Test
  public void testDuplicatedRegistration() {

	  RegistrationDataV2TO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de",
      ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
    RegistrationSummary firstParticipant = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
    checkRegistrationSummary(firstParticipant, 1);

    try {
      frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
      Assert.fail("Expected ValidationException to be thrown");
    } catch (ValidationException ex) {
      assertThat(ex.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.PARTICIPANT_ALREADY_REGISTERED);
    }

  }

  @Test
  public void testFindPublicRunningDinnersSimple() {

    LocalDate todayIn29Days = todayIn30Days.minusDays(1);
    List<RunningDinner> publicRunningDinners = frontendRunningDinnerService.findPublicRunningDinners(todayIn29Days);
    assertDinnerFound(publicRunningDinners);
  }

  @Test
  public void testFindPublicDinnersSeveral() {

    LocalDate now = LocalDate.now();
    LocalDate todayIn35Days = now.plusDays(35);
    LocalDate todayIn40Days = now.plusDays(40);
    LocalDate todayIn41Days = now.plusDays(41);
    
    RunningDinner firstPublicDinner = testHelperService.createPublicRunningDinner(todayIn40Days, 3);
    RunningDinner secondPublicDinner = testHelperService.createPublicRunningDinner(todayIn41Days, 3);

    RunningDinner closedRunningDinner = testHelperService.createPublicRunningDinner(todayIn40Days, 3, RegistrationType.OPEN, true);

    List<RunningDinner> publicRunningDinners = frontendRunningDinnerService.findPublicRunningDinners(todayIn35Days);
    assertThat(publicRunningDinners).contains(firstPublicDinner, secondPublicDinner);
    assertThat(publicRunningDinners).doesNotContain(closedRunningDinner);
  }

  @Test
  public void cancelledDinnerNotFound() {
    
    LocalDate todayIn29Days = todayIn30Days.minusDays(1);
    List<RunningDinner> publicRunningDinners = frontendRunningDinnerService.findPublicRunningDinners(todayIn29Days);
    assertDinnerFound(publicRunningDinners);
    
    runningDinnerService.cancelRunningDinner(runningDinner.getAdminId(), todayIn29Days.atTime(10, 10));
    
    publicRunningDinners = frontendRunningDinnerService.findPublicRunningDinners(todayIn29Days);
    assertDinnerNotFound(publicRunningDinners);
  }
  
  private void assertDinnerFound(List<RunningDinner> publicRunningDinners) {
    
    Set<String> publicIds = publicRunningDinners.stream().map(p -> p.getPublicSettings().getPublicId()).collect(Collectors.toSet());
    assertThat(publicIds).contains(runningDinner.getPublicSettings().getPublicId());
  }
  
  private void assertDinnerNotFound(List<RunningDinner> publicRunningDinners) {
    
    Set<String> publicIds = publicRunningDinners.stream().map(p -> p.getPublicSettings().getPublicId()).collect(Collectors.toSet());
    assertThat(publicIds).doesNotContain(runningDinner.getPublicSettings().getPublicId());
  }
  
}
