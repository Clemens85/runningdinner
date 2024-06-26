package org.runningdinner.admin.activity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantRegistrationsAggregationService;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfoList;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ApplicationTest
@ExtendWith(SpringExtension.class)
public class ActivityServiceTest {

	@Autowired
	private ActivityService activityService;

	@Autowired
	private RunningDinnerService runningDinnerService;

	@Autowired
	private FrontendRunningDinnerService frontendRunningDinnerService;

	@Autowired
	private TestHelperService testHelperService;
	
	@Autowired
	private ParticipantRegistrationsAggregationService participantRegistrationsAggregationService;

	@Test
	public void testActivityCreationForNewClosedRunningDinner() {

		LocalDate date = LocalDate.now();
		String email = CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS;
		RunningDinner runningDinner = testHelperService.createClosedRunningDinner(date, email);

		// Reload just for easy date comparing:
		// TODO: This really sucks... I want to be able to compare dates without reloading from database!!!.
		runningDinner = runningDinnerService.findRunningDinnerByAdminId(runningDinner.getAdminId());

		List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
		assertThat(activities).hasSize(1);

		Activity firstActivity = activities.get(0);
		assertThat(firstActivity.getActivityType()).isEqualTo(ActivityType.DINNER_CREATED);
		assertThat(firstActivity.getOriginator()).isEqualTo(email);
		assertThat(firstActivity.getActivityHeadline()).isNotEmpty();
		assertThat(firstActivity.getActivityMessage()).isNotEmpty();
		assertThat(firstActivity.getActivityDate()).isEqualTo(runningDinner.getCreatedAt());
	}

	@Test
	public void testActivityCreationForNewPublicRunningDinner() {
		
	  LocalDate date = LocalDate.now().plusDays(30);
		String email = CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS;
		RunningDinner runningDinner = testHelperService.createPublicRunningDinner(date, 3);

		List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
		assertThat(activities).hasSize(1);

		Activity firstActivity = activities.get(0);
		assertThat(firstActivity.getActivityType()).isEqualTo(ActivityType.DINNER_CREATED);
		assertThat(firstActivity.getOriginator()).isEqualTo((email));
	}

	@Test
	public void testActivityCreationForNewParticipants() {

		LocalDate date = LocalDate.now().plusDays(30);
		RunningDinner runningDinner = testHelperService.createPublicRunningDinner(date, 3);

		RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Muster", "max@muster.de",
				ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 3);
		frontendRunningDinnerService.performRegistration(runningDinner.getPublicSettings().getPublicId(), registrationData, false);

		registrationData = TestUtil.createRegistrationData("Foo Bar", "foo@bar.de",
				ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 3);
		frontendRunningDinnerService.performRegistration(runningDinner.getPublicSettings().getPublicId(), registrationData, false);
		
		List<Activity> adminActivites = activityService.findAdministrationActivityStream(runningDinner);
		assertThat(adminActivites).hasSize(1);
		assertThat(adminActivites.get(0).getActivityType()).isEqualTo(ActivityType.DINNER_CREATED);
	
		ParticipantRegistrationInfoList participantRegistrationInfoList = participantRegistrationsAggregationService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 0);
		var registrations = participantRegistrationInfoList.getRegistrations();
		assertThat(registrations).hasSize(2);
	}
}
