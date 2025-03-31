package org.runningdinner.dataimport;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.participant.rest.TeamPartnerWishRegistrationDataTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.validation.Valid;

@Service
public class ParticipantJsonExportImportService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ParticipantJsonExportImportService.class);
  
	private final ParticipantService participantService;
	
	public ParticipantJsonExportImportService(ParticipantService participantService) {
		this.participantService = participantService;
	}

	public List<ParticipantInputDataTO> exportAsJsonList(@ValidateAdminId String adminId) {
		List<Participant> participants = participantService.findParticipants(adminId, false);
		return participants
						.stream()
						.map(p -> mapFromParticipant(p, participants))
						.filter(Objects::nonNull)
						.toList();
	}

	public List<ParticipantInputDataTO> importFromJsonList(String adminId, @Valid List<ParticipantInputDataTO> participants) {
		List<ParticipantInputDataTO> failedImports = new ArrayList<>();
		for (var p : participants) {
			try {
				participantService.addParticipant(adminId, p);
				LOGGER.info("Imported participant {}", p);
			} catch (Exception e) {
				LOGGER.error("Failed to import participant {}", p, e);
				failedImports.add(p);
			}
		}
		return failedImports;
	}
	
	private static ParticipantInputDataTO mapFromParticipant(Participant participant, List<Participant> allParticipants) {
		if (participant.isTeamPartnerWishRegistratonChild()) {
			return null;
		}
		ParticipantInputDataTO result = new ParticipantInputDataTO(participant);
		if (participant.isTeamPartnerWishRegistratonRoot()) {
			Participant child = allParticipants
														.stream()
														.filter(p -> p.isTeamPartnerWishRegistrationChildOf(participant))
														.findFirst()
														.orElseThrow(() -> new IllegalStateException("Could not find child participant for " + participant));
			TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData = new TeamPartnerWishRegistrationDataTO(child.getName());
			teamPartnerWishRegistrationData.setEmail(child.getEmail());
			teamPartnerWishRegistrationData.setMobileNumber(child.getMobileNumber());
			result.setTeamPartnerWishRegistrationData(teamPartnerWishRegistrationData);
		}
		return result;
	}
}
