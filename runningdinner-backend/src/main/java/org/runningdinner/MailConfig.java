package org.runningdinner;

import org.runningdinner.mail.pool.MailSenderConfig;
import org.runningdinner.mail.pool.MailSenderLimit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.Assert;

@Configuration
public class MailConfig {

	public static final String MAIL_JET_CONFIG_PREFIX = "mail.mailjet";
	public static final String AWS_SES_CONFIG_PREFIX = "mail.awsses";
	public static final String SMTP_CONFIG_PREFIX = "mail.smtp";

	@Value("${mail.mailjet.enabled}")
	private boolean mailJetApiEnabled;

	@Value("${mail.awsses.enabled}")
	private boolean awsSesEnabled;

	@Value("${mail.smtp.enabled}")
	private boolean smtpEnabled;

	@Value("${mail.awsses.username:}")
	private String awsSesUsername;

	@Value("${mail.awsses.password:}")
	private String awsSesPassword;

  @Value("${mail.mailjet.key.public:}")
  private String mailJetApiKeyPublic;

  @Value("${mail.mailjet.key.private:}")
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
  
  @Value("${mail.html}")
  private boolean htmlEmail;

	@Value("${contact.mail}")
	private String contactMailAddress;

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

  public boolean isHtmlEmail() {
    return htmlEmail;
  }

  public String getMailJetApiKeyPublicMandatory() {
		Assert.hasText(mailJetApiKeyPublic, "mail.mailjet.key.public must be set when enabling MailJet API");
    return mailJetApiKeyPublic;
  }

  public String getMailJetApiKeyPrivateMandatory() {
		Assert.hasText(mailJetApiKeyPrivate, "mail.mailjet.key.private must be set when enabling MailJet API");
		return mailJetApiKeyPrivate;
  }

	public String getAwsSesUsernameMandatory() {
		Assert.hasText(awsSesUsername, "mail.awsses.username must be set when enabling AWS SES");
		return awsSesUsername;
	}

	public String getAwsSesPasswordMandatory() {
		Assert.hasText(awsSesPassword, "mail.awsses.password must be set when enabling AWS SES");
		return awsSesPassword;
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

	public MailSenderConfig getMailSenderConfigForPrefix(String configPrefix) {
		MailSenderLimit limits = getMailSenderLimitFromConfig(configPrefix);
		int priority = getMailSenderPriorityFromConfig(configPrefix);
		boolean fallback = getMailSenderFallbackFromConfig(configPrefix);
		String fromAddress = getMailSenderFromConfigMandatory(configPrefix);
		return new MailSenderConfig(limits, fromAddress, priority, fallback);
	}

	private MailSenderLimit getMailSenderLimitFromConfig(String configPrefix) {
		Integer dailyLimit = environment.getProperty(configPrefix + ".limit.daily", Integer.class, -1);
		Integer monthlyLimit = environment.getProperty(configPrefix + ".limit.monthly", Integer.class, -1);
		return new MailSenderLimit(dailyLimit, monthlyLimit);
	}

	private int getMailSenderPriorityFromConfig(String configPrefix) {
		return environment.getProperty(configPrefix + ".priority", Integer.class, 0);
	}

	private boolean getMailSenderFallbackFromConfig(String configPrefix) {
		return environment.getProperty(configPrefix + ".fallback", Boolean.class, false);
	}

	private String getMailSenderFromConfigMandatory(String configPrefix) {
		return environment.getRequiredProperty(configPrefix + ".from");
	}

	public String getContactMailAddress() {
		return contactMailAddress;
	}
}
