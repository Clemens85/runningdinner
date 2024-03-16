
package org.runningdinner.core.util;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.FuzzyBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Closeable;
import java.io.IOException;
import java.util.*;

/**
 * Contains some helper method used throughout the whole project
 * 
 * @author Clemens Stich
 * 
 */
public class CoreUtil {

  public static String NEWLINE = System.getProperty("line.separator");

  private static final Logger LOGGER = LoggerFactory.getLogger(CoreUtil.class);

  public static <T> boolean isEmpty(final Collection<T> collection) {

    return (collection == null || collection.isEmpty());
  }

  public static <T> boolean isNotEmpty(final Collection<T> collection) {

    return !isEmpty(collection);
  }

  public static <K, V> boolean isEmpty(final Map<K, V> collection) {

    return (collection == null || collection.isEmpty());
  }

  public static <K, V> boolean isNotEmpty(final Map<K, V> collection) {

    return !isEmpty(collection);
  }

  /**
   * Distributes all elements of the middle-collection equally to the left- and right-collection.<br>
   * Ideally the left-size equals to right-size after method invocation.
   * 
   * @param left The "left"-side collection in which to distribute elements
   * @param middle The collection from which to take the elements for distribution.
   * @param right The "right"-side collection in which to distribute elements
   */
  public static <T> void distributeEqually(final Collection<T> left, final Collection<T> middle, final Collection<T> right) {

    for (T m : middle) {
      if (left.size() < right.size()) {
        left.add(m);
      } else {
        right.add(m);
      }
    }
  }

  /**
   * Returns a new set with all objects that were passed by theSet except the object exclude.<br>
   * In other words: Result = theSet - exclude
   * 
   * @param exclude The object that shall be excluded
   * @param theSet Original Set that contains all objects. This set will not be modified.
   * @return New constructed set with the result of the subtraction
   */
  public static <T> Set<T> excludeFromSet(final T exclude, final Set<T> theSet) {

    Set<T> result = new HashSet<>();
    excludeFromCollection(exclude, theSet, result);
    return result;
  }
  
  /**
   * Returns a new set with all objects that were passed by theSet except the collection to exclude.<br>
   * In other words: Result = theSet - excludeCollection
   * 
   * @param excludeCollection The collection that shall be excluded
   * @param theSet Original Set that contains all objects. This set will not be modified.
   * @return New constructed set with the result of the subtraction
   */
  public static <T> Set<T> excludeMultipleFromSet(final Collection<T> excludeCollection, final Set<T> theSet) {

    Set<T> result = theSet;
    for (T exclude : excludeCollection) {
    	result = excludeFromSet(exclude, result);
    }
    return result;
  }
  
  public static <T> List<T> excludeFromList(T exclude, List<T> theList) {

    List<T> result = new ArrayList<>();
    excludeFromCollection(exclude, theList, result);
    return result;
  }
  
  /**
   * Closes the passed stream safely.<br>
   * If the stream is null or an exception occurs the method gracefully returns without an error.
   * 
   * @param stream
   */
  public static void closeStream(Closeable stream) {

    if (stream != null) {
      try {
        stream.close();
      } catch (IOException e) {
        LOGGER.error("Failed to close stream", e);
      }
    }
  }

  /**
   * Asserts that the passed testNumber is smaller as the passed comparingValue.
   * 
   * @param testNumber The number which shall be checked
   * @param comparingValue The reference-value for comparison
   * @param message The error message that shall be wrapped into the exception if the assertion fails
   * @throws IllegalArgumentException If assertion fails
   */
  public static void assertSmaller(int testNumber, int comparingValue, String message) {

    if (!(testNumber < comparingValue)) {
      throw new IllegalArgumentException(message);
    }
  }

  /**
   * Asserts that the passed testNumber is not negative.
   * 
   * @param testNumber The number which shall be checked
   * @param message The error message that shall be wrapped into the exception if the assertion fails
   * @throws IllegalArgumentException If assertion fails
   */
  public static void assertNotNegative(int testNumber, String message) {

    if (testNumber < 0) {
      throw new IllegalArgumentException(message);
    }
  }

  /**
   * Asserts that the passed object is not null
   * 
   * @param obj The object to test for
   * @param message The error message that shall be wrapped into the exception if the assertion fails
   * @throws IllegalArgumentException If assertion fails
   */
  public static void assertNotNull(Object obj, String message) {

    if (null == obj) {
      throw new IllegalArgumentException(message);
    }
  }

  /**
   * Throws an exception if the passed string is null or empty.
   * 
   * @param s The string to test for
   * @param message The error message that shall be wrapped into the exception if the assertion fails
   * @throws IllegalArgumentException If assertion fails
   */
  public static void assertNotEmpty(final String s, String message) {

    if (StringUtils.isEmpty(s)) {
      throw new IllegalArgumentException(message);
    }
  }

  /**
   * Asserts that the passed testNumber is smaller or equal as the passed comparingValue.
   * 
   * @param testNumber The number which shall be checked
   * @param comparingValue The reference-value for comparison
   * @param message The error message that shall be wrapped into the exception if the assertion fails
   * @throws IllegalArgumentException If assertion fails
   */
  public static void assertSmallerOrEq(int testNumber, int comparingValue, String message) {

    if (!(testNumber <= comparingValue)) {
      throw new IllegalArgumentException(message);
    }
  }

  /**
   * Asserts that the passed collection has the passed size.
   * 
   * @param collection The collection which shall be checked
   * @param expectedSize The expected size of the passed collection
   * @param message The error message that shall be wrapped into the exception if the assertion fails
   * @throws IllegalArgumentException If assertion fails
   */
  public static <T> void assertHasSize(final Collection<T> collection, int expectedSize, String message) {

    if (collection == null || collection.size() != expectedSize) {
      throw new IllegalArgumentException(message);
    }
  }

  public static <T extends AbstractEntity> T findById(final Collection<T> entities, UUID id) {
    for (T entity : entities) {
      if (entity.isSameId(id)) {
        return entity;
      }
    }
    return null;
  }
  
  /**
   * Safely converts a string to a number <br>
   * If the passed string cannot be converted the passed fallback is returned.
   * 
   * @param str The string to convert
   * @param fallback Fallback to return
   * @return
   */
  public static int convertToNumber(String str, int fallback) {

    try {
      if (StringUtils.isEmpty(str)) {
        return fallback;
      }
      double tmp = Double.parseDouble(str.trim());
      return (int) tmp;
    } catch (NumberFormatException ex) {
      LOGGER.error("Could not parse string {} as number", str, ex);
      return fallback;
    }
  }

  /**
   * Safely converts the passed String to a FuzzyBoolean.<br>
   * Mainly this method checks for occurrence like "true" or "false" in order to return the appropriate FuzzyBoolean. It used however also
   * other patterns like "yes" or "no" for checking.
   * 
   * @param str The string to convert
   * @param fallback Fallback to return
   * @return
   */
  public static FuzzyBoolean convertToBoolean(String str, FuzzyBoolean fallback) {

    if (StringUtils.isEmpty(str)) {
      return fallback;
    }
    String boolStr = str.trim();
    if ("true".equalsIgnoreCase(boolStr) || "x".equalsIgnoreCase(boolStr) || "ja".equalsIgnoreCase(boolStr) || "yes".equalsIgnoreCase(boolStr)) {
      return FuzzyBoolean.TRUE;
    }

    if ("false".equalsIgnoreCase(boolStr) || "no".equalsIgnoreCase(boolStr) || "o".equalsIgnoreCase(boolStr) || "nein".equalsIgnoreCase(boolStr)) {
      return FuzzyBoolean.FALSE;
    }
    return fallback;
  }

  public static boolean isOneTrue(boolean ... boolVars) {

    for (boolean boolVar : boolVars) {
      if (boolVar) {
        return true;
      }
    }
    return false;
  }
  
  public static Locale getDefaultLocale() {

    return Locale.GERMAN;
  }

  public static boolean isMobileBrowser(final String requestHeaderString) {

    String userAgent = requestHeaderString.toLowerCase();
    return userAgent.matches(
            "(?i).*((android|bb\\d+|meego).+mobile|avantgo|bada\\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino).*") ||
            userAgent.substring(0, 4).matches(
                    "(?i)1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\\-|your|zeto|zte\\-");
  }

  private static <T> Collection<T> excludeFromCollection(T exclude, Collection<T> incomingCollection, Collection<T> newCollection) {
    
    for (T obj : incomingCollection) {
      if (!obj.equals(exclude)) {
        newCollection.add(obj);
      }
    }
    return newCollection;
  }

  public static boolean allNotNull(Object... objects) {
    for (Object obj : objects) {
      if (obj == null) {
        return false;
      }
    }
    return true;
  }
  
  public static <T> boolean setsAreEqual(Set<T> set1, Set<T> set2) {
    if (set1.size() != set2.size()) {
        return false; // If the sizes are different, they can't be equal.
    }
    return set1.containsAll(set2) && set2.containsAll(set1);
}

}
