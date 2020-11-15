package org.runningdinner.core;

/**
 * Contains beside TRUE and FALSE also a state for UNKNOWN.<br>
 * This is mainly used for preventing null-booleans.
 * 
 * @author Clemens Stich
 * 
 */
public enum FuzzyBoolean {
	TRUE, FALSE, UNKNOWN
}
