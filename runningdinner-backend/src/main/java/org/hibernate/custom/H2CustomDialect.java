package org.hibernate.custom;

import java.sql.Types;

import org.hibernate.dialect.H2Dialect;

public class H2CustomDialect extends H2Dialect {

  public H2CustomDialect() {
    
    this.registerColumnType(Types.BINARY, "varbinary");
  }
}
