package org.runningdinner.dinnerroute.optimization.notification;

public class OptimizationFinishedEvent {

  private String adminId;
  private String optimizationId;
  private String errorMessage;

  public OptimizationFinishedEvent(String adminId, String optimizationId, String errorMessage) {
    this.adminId = adminId;
    this.optimizationId = optimizationId;
    this.errorMessage = errorMessage;
  }

	protected OptimizationFinishedEvent() {
		// NOP
	}

  public String getAdminId() {
    return adminId;
  }

  public String getOptimizationId() {
    return optimizationId;
  }

  public String getErrorMessage() {
    return errorMessage;
  }
}
