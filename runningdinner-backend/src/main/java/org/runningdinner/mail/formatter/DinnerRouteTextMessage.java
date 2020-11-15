package org.runningdinner.mail.formatter;

public interface DinnerRouteTextMessage extends SimpleTextMessage {

	String getSelfTemplate();

	String getHostsTemplate();

}
