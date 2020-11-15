package org.runningdinner.wizard.upload;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

public class ParticipantUploadSettingsTO {

	@NotEmpty
	private String fileId;

	@NotNull
	private ParsingConfigurationTO parsingConfiguration;

	public String getFileId() {
		return fileId;
	}

	public void setFileId(String fileId) {
		this.fileId = fileId;
	}

	public ParsingConfigurationTO getParsingConfiguration() {
		return parsingConfiguration;
	}

	public void setParsingConfiguration(ParsingConfigurationTO parsingConfiguration) {
		this.parsingConfiguration = parsingConfiguration;
	}

	@Override
	public String toString() {
		return "fileId=" + fileId + ", parsingConfiguration=" + parsingConfiguration;
	}

}
