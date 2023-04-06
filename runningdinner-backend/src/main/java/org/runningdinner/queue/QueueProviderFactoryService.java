package org.runningdinner.queue;

import javax.annotation.PostConstruct;

import org.runningdinner.core.util.EnvUtilService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class QueueProviderFactoryService {

  private static final Logger LOGGER = LoggerFactory.getLogger(QueueProviderFactoryService.class);

  @Autowired
  private EnvUtilService envUtilService;

  private QueueProvider queueProvider;

  @PostConstruct
  public void init() {
    if (envUtilService.isProfileActive("junit")) {
      LOGGER.info("*** Using Mocked In Memory Queue Provider ***");
      queueProvider = new QueueProviderMockInMemory();
    } else if (envUtilService.isProfileActive("dev")) {
      LOGGER.info("*** Using Local Dev Queue Provider ***");
      String endpoint = envUtilService.getConfigProperty("aws.sqs.url");
      queueProvider = new QueueProviderDev(endpoint);
    } else {
      LOGGER.info("*** Using AWS SQS Queue Provider ***");
      queueProvider = new QueueProviderSqs();
    }
  }

  public QueueProvider getQueueProvider() {
    Assert.notNull(queueProvider, "QueueProvider must be initialized!");
    return queueProvider;
  }

}
