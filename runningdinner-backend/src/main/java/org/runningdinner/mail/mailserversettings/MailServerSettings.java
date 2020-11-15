package org.runningdinner.mail.mailserversettings;

import java.io.Serializable;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(as=MailServerSettingsImpl.class)
public interface MailServerSettings extends Serializable {

	String getMailServer();

	int getMailServerPort();

	String getUsername();

	String getPassword();

	boolean isUseAuth();

	boolean isUseTls();

	String getFrom();

	String getReplyTo();

	boolean hasMailServerPort();

}
