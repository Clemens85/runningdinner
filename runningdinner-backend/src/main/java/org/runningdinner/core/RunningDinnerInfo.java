package org.runningdinner.core;

import java.time.LocalDate;

/**
 * Helper interface which holds some of the basic details about a RunningDinner.
 * 
 * @author Clemens
 * 
 */
public interface RunningDinnerInfo {

	/**
	 * Title of the running dinner (just used for display purposes in admin-area). Never null.
	 * 
	 * @return
	 */
	String getTitle();

	/**
	 * The date on which the running dinner shall be performed. Never null
	 * 
	 * @return
	 */
	LocalDate getDate();

	/**
	 * Info about the city in which the running dinner shall take place.<br>
	 * Can be empty
	 * 
	 * @return
	 */
	String getCity();
	
	/**
	 * Info about the zip in which the running dinner shall take place.<br>
	 * Can be empty
	 * 
	 * @return
	 */
	String getZip();


	/**
	 * Determines whether a dinner is public, protected or closed.
	 * @return
	 */
	RegistrationType getRegistrationType();
	
	String getLanguageCode();

	/**
	 * Gets the allowed zips for restrictions of participants
	 *
	 * @return The zip restrictions as plain string
	 */
	String getZipRestrictions();
	
}
