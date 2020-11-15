package org.runningdinner;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
//@Profile("!prod")
@EnableWebSecurity
public class SecurityConfigNone extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    
    http.csrf().disable().authorizeRequests()
        .anyRequest().permitAll();
  }

}
