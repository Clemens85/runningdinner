package org.runningdinner.admin.message.processor;

import org.runningdinner.admin.message.job.MessageJob;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageJobProcessorHelperService {

  @Autowired
  private ApplicationEventPublisher eventPublisher;
  
  @Async
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  public void publishProcessingEventAsync(MessageJob messageJob) {

    eventPublisher.publishEvent(messageJob);    
  }
  
}
