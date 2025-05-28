
package org.runningdinner;

import org.runningdinner.mail.MailSenderLimit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class MailConfig {

  @Value("${mail.smtp.host}")
  private String host;

  @Value("${mail.smtp.port}")
  private int port;

  @Value("${mail.smtp.username}")
  private String username;

  @Value("${mail.smtp.password}")
  private String password;

  @Value("${mail.smtp.auth}")
  private String useAuth;

  @Value("${mail.smtp.starttls.enable}")
  private String enableStartTls;

  @Value("${mail.smtp.enabled:false}")
  private String smtpEnabled;
  
  @Value("${mail.sendgrid.api.key}")
  private String sendGridApiKey;

  @Value("${mail.sendgrid.api.enabled:true}")
  private boolean sendGridApiEnabled;
  
  @Value("${mail.mailjet.api.key.public}")
  private String mailJetApiKeyPublic;

  @Value("${mail.mailjet.api.key.private}")
  private String mailJetApiKeyPrivate;
  
  @Value("${mail.mailjet.api.enabled:true}")
  private boolean mailJetApiEnabled;

  @Value("${mail.aws.ses.enabled:true}")
  private boolean awsSesEnabled;
  
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

  public String getUsername() {

    return username;
  }

  public String getPassword() {

    return password;
  }

  public String getUseAuth() {

    return useAuth;
  }

  public String getEnableStartTls() {

    return enableStartTls;
  }

  public String getSendGridApiKey() {

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

  public String getMailJetApiKeyPublic() {
    return mailJetApiKeyPublic;
  }

  public String getMailJetApiKeyPrivate() {
    return mailJetApiKeyPrivate;
  }

	public String getSmtpEnabled() {
		return smtpEnabled;
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
  
	public MailSenderLimit getSendGridApiLimits() {
		return getMailSenderLimitFromConfig("mail.sendgrid.api");
	}
	
	private MailSenderLimit getMailSenderLimitFromConfig(String configPrefix) {
		Integer dailyLimit = environment.getProperty(configPrefix + ".limit.daily", Integer.class, -1);
		Integer monthlyLimit = environment.getProperty(configPrefix + ".limit.monthly", Integer.class, -1);
		return new MailSenderLimit(dailyLimit, monthlyLimit)
	}
  
}
