package org.runningdinner.core;

/**
 * Used when distributing participants into teams.<br>
 * FORCE_GENDER_MIX means that teams should be mixed up with males and females.<br>
 * FORCE_SAME_GENDER means that teams shall consist of only males or only females.<br>
 * IGNORE_GENDER means that gender aspects are not considered.
 * 
 * @author Clemens Stich
 * 
 */
public enum GenderAspect {

	FORCE_GENDER_MIX, FORCE_SAME_GENDER, IGNORE_GENDER

}
