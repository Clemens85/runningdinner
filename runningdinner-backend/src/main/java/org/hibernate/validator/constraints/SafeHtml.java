package org.hibernate.validator.constraints;

import static java.lang.annotation.ElementType.FIELD;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// TODO: Add corresponding implementation for it, due to it was removed from hibernate validators

@Retention(RetentionPolicy.RUNTIME)
@Target(FIELD)
@Documented
public @interface SafeHtml {

}
