package org.runningdinner.core.converter;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.runningdinner.participant.Participant;

/**
 * Implementations of this interface must provide the means for parsing a file representation into a list with participants
 * 
 * @author Clemens Stich
 * 
 */
public interface FileConverter extends RowConverter {

	/**
	 * Biggest running dinner ever was performed with 2428 participants, so this hard-coded limit should be sufficient for now ;-)
	 */
  int MAX_PARTICIPANTS = 3000;

	/**
	 * Parse the passed input stream and returns a list with participants.
	 * 
	 * @param inputStream The input stream. The caller of this method is responsible for closing this stream himself!
	 * @return The parsed list with participans (can be empty)
	 * @throws IOException If there occurred an IO error while reading the inputStream
	 * @throws ConversionException If there occurred an error during parsing (e.g. wrong file format)
	 */
	List<Participant> parseParticipants(final InputStream inputStream) throws IOException, ConversionException;

}
