package org.runningdinner.admin.check;

import java.lang.reflect.Method;

import org.aopalliance.aop.Advice;
import org.springframework.aop.Pointcut;
import org.springframework.aop.support.AbstractPointcutAdvisor;
import org.springframework.aop.support.StaticMethodMatcherPointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ValidateAdminIdAdvisor extends AbstractPointcutAdvisor {

  private static final long serialVersionUID = 1L;

  @Autowired
  private ValidateAdminIdInterceptor validateAdminIdInterceptor;

  private final StaticMethodMatcherPointcut pointcut = new StaticMethodMatcherPointcut() {

    @Override
    public boolean matches(Method method, Class<?> targetClass) {

      return AnnotationUtil.hasParamAnnotation(method, ValidateAdminId.class);
    }
  };

  @Override
  public Pointcut getPointcut() {

    return pointcut;
  }

  @Override
  public Advice getAdvice() {

    return validateAdminIdInterceptor;
  }
}

