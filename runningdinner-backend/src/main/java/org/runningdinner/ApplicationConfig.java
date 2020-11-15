package org.runningdinner;

import java.nio.charset.Charset;
import java.util.TimeZone;

import javax.sql.DataSource;

import org.owasp.AntiSamyFilter;
import org.runningdinner.common.service.IdGenerator;
import org.runningdinner.common.service.impl.DefaultIdGenerator;
import org.runningdinner.core.RunningDinnerCalculator;
import org.runningdinner.core.dinnerplan.DinnerPlanGenerator;
import org.runningdinner.core.dinnerplan.StaticTemplateDinnerPlanGenerator;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.core.util.DateTimeUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.boot.context.ApplicationPidFileWriter;
import org.springframework.boot.web.context.WebServerPortFileWriter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.util.Assert;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;

import com.fasterxml.jackson.databind.SerializationFeature;

import ch.qos.logback.classic.helpers.MDCInsertingServletFilter;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;

@SpringBootApplication
@ComponentScan(basePackages = { "org.runningdinner" })
@EntityScan("org.runningdinner")
@EnableJpaRepositories
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "PT2M") 
public class ApplicationConfig /*extends WebMvcConfigurerAdapter*/ {
  
  public static void main(String[] args) {

    checkSettings();
    
    SpringApplication springApplication = new SpringApplication(ApplicationConfig.class);
    springApplication.addListeners(new ApplicationPidFileWriter(), new WebServerPortFileWriter());
    
    springApplication.run(args);
  }

  private static void checkSettings() {

    DateTimeUtil.setDefaultTimeZoneToEuropeBerlin();

    // verify system property is set
    Assert.isTrue("UTF-8".equals(System.getProperty("file.encoding")), "UTF-8 must be set as file encoding!");

    // and actually verify it is being used
    Charset charset = Charset.defaultCharset();
    Assert.isTrue(charset.equals(Charset.forName("UTF-8")), "Charset UTF-8 must be used!");
  }
  
  @Bean
  public MDCInsertingServletFilter mdcInsertingServletFilter() {
      return new MDCInsertingServletFilter();
  }

  @Bean
  public IdGenerator uuidGenerator() {

    return new DefaultIdGenerator();
  }

  @Bean
  public RunningDinnerCalculator runningDinnerCalculator() {

    return new RunningDinnerCalculator(dinnerPlanGenerator());
  }

  @Bean
  public DinnerPlanGenerator dinnerPlanGenerator() {

    return new StaticTemplateDinnerPlanGenerator();
  }

  @Bean
  public LocaleResolver localeResolver() {
    
    CookieLocaleResolver result = new CookieLocaleResolver();
    result.setCookieName("NG_TRANSLATE_LANG_KEY");
    result.setDefaultLocale(CoreUtil.getDefaultLocale());
    result.setDefaultTimeZone(TimeZone.getTimeZone(DateTimeUtil.getTimeZoneForEuropeBerlin()));
    return result;
  }
  
  @Bean
  public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
    return builder -> {
      builder.featuresToEnable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    };
  }
  

  @Bean
  public FilterRegistrationBean<AntiSamyFilter> jwtFilter() {

    FilterRegistrationBean<AntiSamyFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new AntiSamyFilter());
    registrationBean.addUrlPatterns("/rest/*");
    return registrationBean;
  }

  @Bean
  public LockProvider lockProvider(DataSource dataSource) {

    return new JdbcTemplateLockProvider(dataSource);
  }

}
