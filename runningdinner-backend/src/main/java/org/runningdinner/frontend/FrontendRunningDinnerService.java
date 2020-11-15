package org.runningdinner.frontend;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerRepository;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.partnerwish.TeamPartnerWish;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishState;
import org.runningdinner.participant.partnerwish.TeamPartnerWishStateHandlerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

import com.google.common.collect.Sets;

@Service
public class FrontendRunningDinnerService {

  @Autowired
  private TeamPartnerWishService teamPartnerWishService;
  
	@Autowired
	private ParticipantService participantService;

	@Autowired
	private RunningDinnerRepository runningDinnerRepository;
	
	@Autowired
	private UrlGenerator urlGenerator;

	@Autowired
	private EventPublisher eventPublisher;

	@Autowired
	private ValidatorService validatorService;

	/**
	 * Finds a public running dinner identified by the passed id
	 * 
	 * @param publicDinnerId
	 * @param now
	 * @return
	 * @throws Exception if dinner could not be found or is expired
	 */
	public RunningDinner findRunningDinnerByPublicId(String publicDinnerId, LocalDate now) {

	  Set<RegistrationType> publicRegistationTypes = Sets.newHashSet(RegistrationType.OPEN, RegistrationType.PUBLIC);

		validatorService.checkPublicIdValid(publicDinnerId);
		RunningDinner runningDinner = runningDinnerRepository.findByPublicSettingsPublicIdAndRegistrationTypeInAndCancellationDateIsNull(publicDinnerId, publicRegistationTypes);

		validatorService.checkRunningDinnerNotNull(runningDinner);
		validatorService.checkRunningDinnerNotExpired(runningDinner, now);

		return urlGenerator.addPublicDinnerUrl(runningDinner);
	}

	/**
	 * Retrieves list with all available public running dinners starting at least at the passed date
	 * 
	 * @param now
	 * @return
	 */
  public List<RunningDinner> findPublicRunningDinners(LocalDate now) {

    List<RunningDinner> result = runningDinnerRepository.findAllByRegistrationTypeAndDateAfterAndRunningDinnerTypeAndCancellationDateIsNullOrderByDateAsc(
      RegistrationType.PUBLIC, now, RunningDinnerType.STANDARD);
    return urlGenerator.addPublicDinnerUrl(result);
  }

	/**
	 * Registers a new participant with the data backed by registrationData.
	 * 
	 * @param publicDinnerId The public dinner for which to perform a registration
	 * @param registrationData
	 * @param onlyPreviewAndValidation Don't persist the registration but only validate and generate a preview (if valid) for client
	 */
	@Transactional
	public RegistrationSummary performRegistration(String publicDinnerId, RegistrationDataTO registrationData, boolean onlyPreviewAndValidation) {

		LocalDate now = LocalDate.now();

		RunningDinner runningDinner = findRunningDinnerByPublicId(publicDinnerId, now);

		Assert.state(!runningDinner.getPublicSettings().isRegistrationDeactivated(), "Registration can only performed when not deactivated: " + runningDinner);

		checkRegistrationDate(runningDinner, now);
		checkFullname(registrationData.getFullname());
		participantService.checkDuplicatedRegistration(runningDinner.getAdminId(), registrationData.getEmail());
		
		Participant participant = new Participant();
		participant.setName(ParticipantName.newName().withCompleteNameString(registrationData.getFullname()));
		ParticipantAddress address = ParticipantAddress.parseFromString(registrationData.getStreetWithNr() + "\n"
				+ registrationData.getZip() + " " + registrationData.getCity());
		address.setRemarks(registrationData.getAddressRemarks());
		participant.setAddress(address);
		participant.setAge(registrationData.getAgeNormalized());
		participant.setEmail(registrationData.getEmail());
		participant.setNumSeats(registrationData.getNumberOfSeats());
		participant.setGender(registrationData.getGenderNotNull());
		participant.setMobileNumber(registrationData.getMobile());
		participant.setMealSpecifics(registrationData.getMealSpecifics());
		participant.setNotes(registrationData.getNotes());
		participant.setTeamPartnerWish(registrationData.getTeamPartnerWish());

    TeamPartnerWishStateHandlerService.checkEmailDoesNotEqualTeamPartnerWish(participant);
		
		if (onlyPreviewAndValidation) {
			return createRegistrationSummary(runningDinner, participant);
		}

		Participant registeredParticipant = participantService.addParticipant(runningDinner, participant, true);

		emitNewParticipantEvent(registeredParticipant, runningDinner);

		return createRegistrationSummary(runningDinner, registeredParticipant);
	}

  @Transactional
  public Participant activateSubscribedParticipant(String publicDinnerId, UUID participantId) {

    LocalDateTime now = LocalDateTime.now();
    RunningDinner runningDinner = findRunningDinnerByPublicId(publicDinnerId, now.toLocalDate());
    return participantService.updateParticipantSubscription(participantId, now, true, runningDinner);
  }

  private RegistrationSummary createRegistrationSummary(RunningDinner runningDinner, Participant registeredParticipant) {

		FuzzyBoolean canHost = runningDinner.getConfiguration().canHost(registeredParticipant);
		boolean teamPartnerWishDisabled = runningDinner.getConfiguration().isTeamPartnerWishDisabled();
		
		TeamPartnerWishState teamPartnerWishState = null;
		
		Optional<TeamPartnerWish> optionalTeamPartnerWish = teamPartnerWishService.calculateTeamPartnerWishInfo(registeredParticipant, runningDinner.getAdminId());
		if (optionalTeamPartnerWish.isPresent() && !teamPartnerWishDisabled) {
		  TeamPartnerWish teamPartnerWish = optionalTeamPartnerWish.get();
		  if (teamPartnerWish.getState() == TeamPartnerWishState.EXISTS_SAME_TEAM_PARTNER_WISH || teamPartnerWish.getState() == TeamPartnerWishState.NOT_EXISTING) {
		    teamPartnerWishState = teamPartnerWish.getState();
		  }
		}
		
		return new RegistrationSummary(registeredParticipant, canHost == FuzzyBoolean.TRUE, teamPartnerWishState);
	}

	protected void emitNewParticipantEvent(final Participant newParticipant, final RunningDinner runningDinner) {
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

			@Override
			public void afterCommit() {
				eventPublisher.notifyNewParticipant(newParticipant, runningDinner);
			}
		});
	}

  protected void checkFullname(String fullname) {

    if (!validatorService.isValidFullname(fullname)) {
      throw new ValidationException(new IssueList(new Issue("fullname", IssueKeys.FULLNAME_NOT_VALID, IssueType.VALIDATION)));
    }
  }

  protected void checkRegistrationDate(RunningDinner runningDinner, LocalDate registrationDate) {

    if (!runningDinner.canRegistrate(registrationDate)) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.REGISTRATION_DATE_EXPIRED, IssueType.VALIDATION)));
    }
  }

}
