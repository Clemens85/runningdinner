package org.runningdinner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@Profile("deactivated")
@EnableWebSecurity
public class SecurityConfigBasicAuth extends WebSecurityConfigurerAdapter {
  
  @Value("${rd.basic.auth.username}")
  private String username;
  
  @Value("${rd.basic.auth.password}")
  private String password;
  
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    
    http.csrf().disable().authorizeRequests()
        .antMatchers("/**/health").permitAll()
        .anyRequest().authenticated()
        .and().httpBasic();
  }

  @Autowired
  public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
    auth.inMemoryAuthentication().withUser(username).password(password).roles("USER");
  }

}