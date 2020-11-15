
package org.runningdinner.admin.check;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class AnnotationUtil {
  
  private AnnotationUtil() {
    
    // Nop
  }

  public static boolean hasParamAnnotation(Method method, Class<?> annotationToSearch) {

    Annotation[][] paramAnnotations = method.getParameterAnnotations();
    for (int i = 0; i < paramAnnotations.length; i++) {
      for (Annotation annotation : paramAnnotations[i]) {
        if (annotation.annotationType() == annotationToSearch) {
          return true;
        }
      }
    }
    return false;
  }

  public static Annotation getParamAnnotation(Method method, int paramPos, Class<?> annotationToSearch) {

    Annotation[][] paramAnnotations = method.getParameterAnnotations();
    for (int i = 0; i < paramAnnotations.length; i++) {
      for (Annotation annotation : paramAnnotations[i]) {
        if (i == paramPos && annotation.annotationType() == annotationToSearch) {
          return annotation;
        }
      }
    }
    return null;
  }

  public static List<Integer> getAnnotatedParamPos(Method method, Class<?> annotationToSearch) {

    List<Integer> result = new ArrayList<>();
    Annotation[][] paramAnnotations = method.getParameterAnnotations();
    for (int i = 0; i < paramAnnotations.length; i++) {
      for (Annotation annotation : paramAnnotations[i]) {
        if (annotation.annotationType() == annotationToSearch) {
          result.add(i);
        }
      }
    }
    return result;
  }
}
