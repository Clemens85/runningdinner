package org.runningdinner.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.runningdinner.core.util.RandomNumberGenerator;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;

public class ParticipantGenerator {

	/**
	 * Helper method for quickly generating some arbitrary participants
	 * 
	 * @param numParticipants
	 * @return
	 */
	public static List<Participant> generateParticipants(int numParticipants, int participantNrOffset) {
		List<Participant> result = new ArrayList<Participant>(numParticipants);
		for (int i = 1; i <= numParticipants; i++) {
			int participantNr = i + participantNrOffset;
			result.add(generateParticipant(participantNr));
		}
		return result;
	}

	public static List<Participant> generateParticipants(int numParticipants) {
		return generateParticipants(numParticipants, 0);
	}
	
    public static Participant generateParticipant(int participantNr) {

      Participant participant = new Participant(participantNr);
      participant.setName(
          ParticipantName.newName().withFirstname("first" + participantNr).andLastname("last" + participantNr));
      participant.setEmail("participant_" + participantNr + "@mail.de");
      participant.setAddress(ParticipantAddress.parseFromString("MyStreet 1\n12345 MyCity"));
      return participant;
    }

	/**
	 * Sets the number of seats randomly for each participant in the passed list. After method call half of all participants have enough
	 * seats for being a host, the other half have too few seats. This is controller by the minNeededSeats parameter.
	 * 
	 * @param participants
	 * @param minNeededSeats
	 */
	public static void distributeSeatsEqualBalanced(List<Participant> participants, int minNeededSeats) {
		distributeSeats(participants, minNeededSeats, participants.size() / 2);
	}

	public static void distributeSeats(List<Participant> participants, int minNeededSeats, int numParticipantsWithEnoughSeats) {

		final int limit = Math.min(numParticipantsWithEnoughSeats, participants.size());

		final RandomNumberGenerator randomGenerator = new RandomNumberGenerator();

		int cnt = 0;
		for (Participant participant : participants) {
			if (cnt++ < limit) {
				int numSeats = randomGenerator.randomNumber(minNeededSeats, minNeededSeats * 2);
				participant.setNumSeats(numSeats);
			}
			else {
				int numSeats = randomGenerator.randomNumber(1, Math.max(1, minNeededSeats - 1));
				participant.setNumSeats(numSeats);
			}
		}

		Collections.shuffle(participants);
	}

	public static void distributeGender(List<Participant> participants, int numMales, int numFemales) {

		final int limitMales = Math.min(numMales, participants.size());
		final int limitFemales = Math.min(limitMales + numFemales, participants.size());

		int cnt = 0;
		for (Participant participant : participants) {
			if (cnt < limitMales) {
				participant.setGender(Gender.MALE);
			}
			else if (cnt < limitFemales) {
				participant.setGender(Gender.FEMALE);
			}
			else {
				participant.setGender(Gender.UNDEFINED);
			}
			cnt++;
		}

		Collections.shuffle(participants);
	}
	
	public static List<Participant> generateEqualBalancedParticipants(int participantNrOffset) {
		List<Participant> result = generateParticipants(18, participantNrOffset);
		ParticipantGenerator.distributeSeatsEqualBalanced(result, 6);
		return result;
	}
}
