
package org.runningdinner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

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

  @Value("${sendgrid.api.key}")
  private String sendGridApiKey;
  
  @Value("${mail.replyto}")
  private String defaultReplyTo;

  @Value("${mail.from}")
  private String defaultFrom;
  
  @Value("${mail.html}")
  private boolean htmlEmail;

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
  
}
