//package org.runningdinner.event;
//
//import java.util.Optional;
//
//import org.runningdinner.core.RunningDinner;
//import org.runningdinner.mail.BaseMail;
//import org.runningdinner.mail.mailserversettings.MailServerSettings;
//import org.springframework.context.ApplicationEvent;
//
//public class SendMailsStartedEvent extends ApplicationEvent {
//
//	private static final long serialVersionUID = 1L;
//
//	protected Optional<MailServerSettings> customMailServerSettings = Optional.empty();
//
//	protected RunningDinner runningDinner;
//
//	public SendMailsStartedEvent(Object source, BaseMail mail) {
//		super(source);
//		this.runningDinner = mail.getRunningDinner();
//		this.customMailServerSettings = mail.getCustomMailServerSettings();
//	}
//
//	public Optional<MailServerSettings> getCustomMailServerSettings() {
//		return customMailServerSettings;
//	}
//
//	public void setCustomMailServerSettings(Optional<MailServerSettings> customMailServerSettings) {
//		this.customMailServerSettings = customMailServerSettings;
//	}
//
//	public RunningDinner getRunningDinner() {
//		return runningDinner;
//	}
//
//	public void setRunningDinner(RunningDinner runningDinner) {
//		this.runningDinner = runningDinner;
//	}
//
//}
