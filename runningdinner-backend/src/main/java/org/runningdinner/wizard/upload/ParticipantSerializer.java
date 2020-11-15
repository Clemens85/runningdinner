package org.runningdinner.wizard.upload;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esotericsoftware.kryo.Kryo;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;

public class ParticipantSerializer {

	private static final Logger LOGGER = LoggerFactory.getLogger(ParticipantSerializer.class);

	public void saveToTempLocation(List<Participant> participants, String filepath) throws IOException {

		Kryo kryo = new Kryo();

		LOGGER.info("Serializing {} participants to {}", participants.size(), filepath);

		DummySerializerHolderClass holderClass = new DummySerializerHolderClass();
		holderClass.setParticipants(participants);

		FileOutputStream fileOut = null;
		Output output = null;

		try {
			fileOut = new FileOutputStream(filepath);
			output = new Output(fileOut);
			kryo.writeObject(output, holderClass);
		}
		finally {
			CoreUtil.closeStream(output);
			CoreUtil.closeStream(fileOut);
		}
	}

	public List<Participant> loadFromTempLocation(String filepath) throws IOException {

		Kryo kryo = new Kryo();

		FileInputStream fileIn = null;
		Input input = null;

		LOGGER.info("Deserialize participants from {}", filepath);

		try {
			fileIn = new FileInputStream(filepath);
			input = new Input(fileIn);
			DummySerializerHolderClass tmpResult = kryo.readObject(input, DummySerializerHolderClass.class);
			return tmpResult.getParticipants();
		}
		finally {
			CoreUtil.closeStream(input);
			CoreUtil.closeStream(fileIn);
		}
	}

	/**
	 * Wrapper around participant list, as kryo has some problems when using plain lists (-> quick workaround)
	 * 
	 * @author Clemens Stich
	 * 
	 */
	static class DummySerializerHolderClass {
		private List<Participant> participants;

		public DummySerializerHolderClass() {
		}

		public List<Participant> getParticipants() {
			return participants;
		}

		public void setParticipants(List<Participant> participants) {
			this.participants = participants;
		}

	}

}
