package org.runningdinner.initialization;

import java.time.LocalDate;

import javax.annotation.PostConstruct;

import org.runningdinner.common.exception.TechnicalException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("demodinner")
public class DataInitializationService {

  @Autowired
  private CreateRunningDinnerInitializationService createRunningDinnerInitializationService;
  
  @PostConstruct
  protected void onStartUp() {

    new Thread(new Runnable() { // NOSONAR
      
      @Override
      public void run() {
        
        try {
          Thread.sleep(1500);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          throw new TechnicalException(e);
        }
        
        createRunningDinnerInitializationService.createClosedRunningDinnerAsync(LocalDate.now().plusDays(20));
        createRunningDinnerInitializationService.createPublicRunningDinnerAsync(LocalDate.now().plusDays(30));
      }
    }).start();
  }

}
