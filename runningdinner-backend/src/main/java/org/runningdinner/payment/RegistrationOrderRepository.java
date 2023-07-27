package org.runningdinner.payment;

import org.runningdinner.core.RunningDinnerRelatedRepository;

public interface RegistrationOrderRepository extends RunningDinnerRelatedRepository<RegistrationOrder> {

  RegistrationOrder findByAdminIdAndPaypalOrderId(String adminId, String paypalOrderId);
  
}
