package org.runningdinner.wiremock;

import org.runningdinner.payment.PaypalMock;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.github.tomakehurst.wiremock.WireMockServer;

@Service
public class WireMockControlService {
    
  private WireMockServer wireMockServer;

  public WireMockServer getRunningServer() {
    
    String errMessage = "WireMockServer must be started before calling getRunningServer. Please use startServer() for doing so";
    Assert.notNull(wireMockServer, errMessage);
    Assert.state(wireMockServer.isRunning(), errMessage);
    return wireMockServer;
  }
  
  public WireMockServer startServer() {
    
    wireMockServer = new WireMockServer(PaypalMock.PORT);
    wireMockServer.start();
    return wireMockServer;
  }
  
  public void stopServer() {
    wireMockServer.resetMappings();
    wireMockServer.resetScenarios();
    wireMockServer.resetRequests();
    wireMockServer.stop();
  }
  
}
