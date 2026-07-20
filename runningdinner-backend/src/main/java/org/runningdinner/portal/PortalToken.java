package org.runningdinner.portal;

import com.google.common.base.MoreObjects;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import org.runningdinner.core.AbstractEntity;

@Entity
public class PortalToken extends AbstractEntity {

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false, unique = true)
  private String token;

  protected PortalToken() {
    // JPA
  }

  public PortalToken(String email, String token) {
    this.email = email;
    this.token = token;
  }

  public String getEmail() {
    return email;
  }

  public String getToken() {
    return token;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
            .add("email", email)
            .add("token", token)
            .toString();
  }
}
