package org.runningdinner.mail.formatter;

public interface TeamArrangementTextMessage extends SimpleTextMessage {

	String getHostMessagePartTemplate();

	String getNonHostMessagePartTemplate();
}
