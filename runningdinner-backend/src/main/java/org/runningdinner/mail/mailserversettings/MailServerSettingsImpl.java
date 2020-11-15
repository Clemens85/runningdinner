package org.runningdinner.mail.mailserversettings;

import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MailServerSettingsImpl implements MailServerSettings {

	private static final long serialVersionUID = -722009921667020426L;

	@NotBlank(message = "error.required.mailserversettings.mailserver")
	private String mailServer = StringUtils.EMPTY;

	@Min(value = 0, message = "error.mailserversettings.mailserverport")
	private int mailServerPort = 25;

	private String username = StringUtils.EMPTY;

	private String password = StringUtils.EMPTY;

	private boolean useAuth = true;

	private boolean useTls = true;

	@NotBlank(message = "error.required.mailserversettings.from")
	@Email(message = "error.required.mailserversettings.from")
	private String from = StringUtils.EMPTY;

	private String replyTo = StringUtils.EMPTY;

	public MailServerSettingsImpl() {
	}

	@Override
	public String getMailServer() {
		return mailServer;
	}

	public void setMailServer(String mailServer) {
		this.mailServer = mailServer;
	}

	@Override
	public int getMailServerPort() {
		return mailServerPort;
	}

	public void setMailServerPort(int mailServerPort) {
		this.mailServerPort = mailServerPort;
	}

	@Override
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	@Override
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	@Override
	public boolean isUseAuth() {
		return useAuth;
	}

	public void setUseAuth(boolean useAuth) {
		this.useAuth = useAuth;
	}

	@Override
	public boolean isUseTls() {
		return useTls;
	}

	public void setUseTls(boolean useTls) {
		this.useTls = useTls;
	}

	@Override
	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	@Override
	public String getReplyTo() {
		return replyTo;
	}

	public void setReplyTo(String replyTo) {
		this.replyTo = replyTo;
	}

	@Override
	public boolean hasMailServerPort() {
		return mailServerPort > 0;
	}

	@Override
	public String toString() {
		return "MailServerSettingsImpl [mailServer=" + mailServer + "]";
	}

}
