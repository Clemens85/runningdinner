package org.runningdinner.core.test.helper;

import org.runningdinner.participant.Participant;

import com.google.common.base.Predicate;

/**
 * Returns only that participants that have at least the number of seats that was passed when constructing this predicate
 * 
 * @author Clemens
 *
 */
public class MinNumSeatsPredicate implements Predicate<Participant> {

	protected int minNumSeats;

	public MinNumSeatsPredicate(int minNumSeats) {
		super();
		this.minNumSeats = minNumSeats;
	}

	@Override
	public boolean apply(Participant p) {

    return p.getNumSeats() >= minNumSeats;
  }
}
