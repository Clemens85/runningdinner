
package org.runningdinner;

import org.runningdinner.mail.MailSenderLimit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.Assert;

@Configuration
public class MailConfig {

	@Value("${mail.sendgrid.api.enabled}")
	private boolean sendGridApiEnabled;

	@Value("${mail.mailjet.api.enabled}")
	private boolean mailJetApiEnabled;

	@Value("${mail.aws.ses.enabled}")
	private boolean awsSesEnabled;

	@Value("${mail.smtp.enabled}")
	private boolean smtpEnabled;

	@Value("${mail.sendgrid.api.key:}")
  private String sendGridApiKey;

  @Value("${mail.mailjet.api.key.public:}")
  private String mailJetApiKeyPublic;

  @Value("${mail.mailjet.api.key.private:}")
  private String mailJetApiKeyPrivate;

	@Value("${mail.smtp.host}")
	private String host;

	@Value("${mail.smtp.port}")
	private int port;

	@Value("${mail.smtp.username:}")
	private String username;

	@Value("${mail.smtp.password:}")
	private String password;

	@Value("${mail.smtp.auth}")
	private String useAuth;

	@Value("${mail.smtp.starttls.enable}")
	private String enableStartTls;

  @Value("${mail.replyto}")
  private String defaultReplyTo;

  @Value("${mail.from}")
  private String defaultFrom;
  
  @Value("${mail.html}")
  private boolean htmlEmail;
  
  @Autowired
  private Environment environment;

  public String getHost() {

    return host;
  }

  public int getPort() {

    return port;
  }

  public String getUsernameMandatory() {
		Assert.hasText(username, "mail.smtp.username must be set when enabling SMTP");
    return username;
  }

  public String getPasswordMandatory() {
		Assert.hasText(password, "mail.smtp.password must be set when enabling SMTP");
    return password;
  }

  public String getUseAuth() {

    return useAuth;
  }

  public String getEnableStartTls() {

    return enableStartTls;
  }

  public String getSendGridApiKeyMandatory() {
		Assert.hasText(sendGridApiKey, "mail.sendgrid.api.key must be set when enabling SendGrid API");
    return sendGridApiKey;
  }

  public String getDefaultReplyTo() {
    return defaultReplyTo;
  }

  public String getDefaultFrom() {
    return defaultFrom;
  }

  public boolean isHtmlEmail() {
    return htmlEmail;
  }

  public String getMailJetApiKeyPublicMandatory() {
		Assert.hasText(mailJetApiKeyPublic, "mail.mailjet.api.key.public must be set when enabling MailJet API");
    return mailJetApiKeyPublic;
  }

  public String getMailJetApiKeyPrivateMandatory() {
		Assert.hasText(mailJetApiKeyPrivate, "mail.mailjet.api.key.private must be set when enabling MailJet API");
		return mailJetApiKeyPrivate;
  }

	public boolean isSendGridApiEnabled() {
		return sendGridApiEnabled;
	}

	public boolean isMailJetApiEnabled() {
		return mailJetApiEnabled;
	}

	public boolean isAwsSesEnabled() {
		return awsSesEnabled;
	}

	public boolean isPlainSmtpMailServerEnabled() {
		return smtpEnabled;
	}
  
	public MailSenderLimit getSendGridApiLimits() {
		return getMailSenderLimitFromConfig("mail.sendgrid.api");
	}

  public MailSenderLimit getAwsSesApiLimits() {
    return getMailSenderLimitFromConfig("mail.aws.ses");
  }

  public MailSenderLimit getMailJetApiLimits() {
    return getMailSenderLimitFromConfig("mail.mailjet.api");
  }

	private MailSenderLimit getMailSenderLimitFromConfig(String configPrefix) {
		Integer dailyLimit = environment.getProperty(configPrefix + ".limit.daily", Integer.class, -1);
		Integer monthlyLimit = environment.getProperty(configPrefix + ".limit.monthly", Integer.class, -1);
		return new MailSenderLimit(dailyLimit, monthlyLimit);
	}

}
