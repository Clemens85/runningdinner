
package org.runningdinner;

import java.util.concurrent.Executor;

import org.runningdinner.common.exception.AsyncExceptionHandler;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurerSupport;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig extends AsyncConfigurerSupport {

  @Override
  public Executor getAsyncExecutor() {

    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(6);
    executor.setMaxPoolSize(100);
    executor.setQueueCapacity(1);
    executor.setThreadNamePrefix("CustomAsyncPool-");
//    executor.setAllowCoreThreadTimeOut(true);
    executor.initialize();
    return executor;
  }
  
  @Override
  public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
   
    return new AsyncExceptionHandler();
  }
}
