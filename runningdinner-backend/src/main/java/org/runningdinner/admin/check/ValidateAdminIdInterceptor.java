
package org.runningdinner.admin.check;

import java.util.List;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.runningdinner.common.service.ValidatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
public class ValidateAdminIdInterceptor implements MethodInterceptor {

  @Autowired
  private ValidatorService validatorService;

  @Override
  public Object invoke(MethodInvocation invocation) throws Throwable {

    List<Integer> foundPositions = AnnotationUtil.getAnnotatedParamPos(invocation.getMethod(), ValidateAdminId.class);
    if (CollectionUtils.isEmpty(foundPositions) || foundPositions.size() != 1) {
      return invocation.proceed();
    }

    Object[] arguments = invocation.getArguments();
    Integer index = foundPositions.get(0);

    Object adminIdToCheck = arguments[index];
    validatorService.checkAdminIdValid(adminIdToCheck.toString());
    return invocation.proceed();
  }

}
