package org.runningdinner.participant;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.util.CoreUtil;

import javax.persistence.Embeddable;
import java.util.Objects;

/**
 * Represents the name of a participant.
 * 
 * @author Clemens Stich
 * 
 */
@Embeddable
public class ParticipantName {

  @SafeHtml
	private String firstnamePart;
  @SafeHtml
	private String lastname;

	public ParticipantName() {
		// Unfortunately needed for JPA & Spring MVC
	}

	/**
	 * Contains typically the firstname of a person, but for persons that have several names (e.g. middlename) these name parts are also
	 * contained.
	 * 
	 * @return
	 */
	public String getFirstnamePart() {
		return firstnamePart;
	}

	/**
	 * Contains always the surname of a person
	 * 
	 * @return
	 */
	public String getLastname() {
		return lastname;
	}

	/**
	 * Returns the fullname of a participant
	 * 
	 * @return
	 */
	public String getFullnameFirstnameFirst() {
		String result = firstnamePart;
		if (StringUtils.isEmpty(firstnamePart)) {
			result = StringUtils.EMPTY;
		}
		else {
			if (!StringUtils.isEmpty(lastname)) {
				result += " ";
			}
		}

		if (!StringUtils.isEmpty(lastname)) {
			result += lastname;
		}

		return result;
	}

	// Unfortunately needed by Spring MVC

	public void setFirstnamePart(String firstnamePart) {
		this.firstnamePart = firstnamePart;
	}

	public void setLastname(String lastname) {
		this.lastname = lastname;
	}

	public ParticipantName createDetachedClone() {

    ParticipantName participantName = new ParticipantName();
    participantName.firstnamePart = firstnamePart;
    participantName.lastname = lastname;
    return participantName;
  }

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		ParticipantName that = (ParticipantName) o;
		return Objects.equals(firstnamePart, that.firstnamePart) && Objects.equals(lastname, that.lastname);
	}

	@Override
	public int hashCode() {
		return Objects.hash(firstnamePart, lastname);
	}

	@Override
	public String toString() {
		return getFullnameFirstnameFirst();
	}

	/**
	 * Use this for creating new ParticipantName instances
	 * 
	 * @return
	 */
	public static NameBuilder newName() {
		return new NameBuilder();
	}

  /**
	 * Builder for creating new ParticipantNames in a fluent way
	 * 
	 * @author Clemens Stich
	 * 
	 */
	public static class NameBuilder {

		protected NameBuilder() {
		}

		/**
		 * Construct a ParticipantName with passing in firstname and lastname separately.
		 * 
		 * @return
		 */
		public FirstLastNameBuilder withFirstname(final String firstname) {
			CoreUtil.assertNotEmpty(firstname, "Firstname must not be empty!");
			return new FirstLastNameBuilder(firstname);
		}

		/**
		 * Construct a ParticipantName by using a complete string in the following formats:<br>
		 * Peter Lustig<br>
		 * Max Middlename Mustermann<br>
		 * 
		 * @throws IllegalArgumentException If string was passed in wrong format
		 * @return
		 */
		public ParticipantName withCompleteNameString(final String completeName) {
			ParticipantName result = new ParticipantName();

			String[] nameParts = completeName.trim().split("\\s+");
			if (nameParts.length <= 1) {
				throw new IllegalArgumentException("Complete Name must be in a format like 'Max Mustermann'");
			}

			result.lastname = nameParts[nameParts.length - 1];

			StringBuilder firstnamesBuilder = new StringBuilder();
			int cnt = 0;
			for (int i = 0; i < nameParts.length - 1; i++) {
				if (cnt++ > 0) {
					firstnamesBuilder.append(" ");
				}
				firstnamesBuilder.append(nameParts[i]);
			}
			result.firstnamePart = firstnamesBuilder.toString();

			return result;
		}

	}

	public static class FirstLastNameBuilder {

		private final String firstname;

		protected FirstLastNameBuilder(String firstname) {
			this.firstname = firstname;
		}

		public ParticipantName andLastname(String lastname) {
			CoreUtil.assertNotEmpty(lastname, "Lastname must not be empty!");
			ParticipantName result = new ParticipantName();
			result.firstnamePart = firstname;
			result.lastname = lastname;
			return result;
		}
	}
}
