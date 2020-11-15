package org.runningdinner.core.test.helper;

import org.runningdinner.core.Gender;
import org.runningdinner.participant.Participant;

import com.google.common.base.Predicate;

/**
 * Returns only those participants (when used in collection filtering) that have the gender that is passed in constructor
 * 
 * @author Clemens
 *
 */
public class GenderPredicate implements Predicate<Participant> {

	public static GenderPredicate MALE_GENDER_PREDICATE = new GenderPredicate(Gender.MALE);
	public static GenderPredicate FEMALE_GENDER_PREDICATE = new GenderPredicate(Gender.FEMALE);

	protected Gender filterGender;

	public GenderPredicate(Gender filterGender) {
		super();
		this.filterGender = filterGender;
	}

	@Override
	public boolean apply(Participant p) {

    return p.getGender() == filterGender;
  }

}
