package org.runningdinner.test.util;

import java.lang.reflect.Field;

public class PrivateFieldAccessor {
  
  public static <T> void setField(final T obj, final String fieldName, final Object value) {
    
    try {
      final Field field = getField(obj, fieldName);
      field.setAccessible(true);
      field.set(obj, value);
    } catch (Exception ex) {
      throw new RuntimeException(ex);
    }
  }
  
  private static <T> Field getField(final T obj, final String fieldName) throws NoSuchFieldException {

    Class<?> clazz = obj.getClass();

    while (clazz != null) {
      for (Field field : clazz.getDeclaredFields()) {
        if (field.getName().equals(fieldName)) {
          return field;
        }
      }
      clazz = clazz.getSuperclass();
    }
    throw new NoSuchFieldException(fieldName);
  }

}
