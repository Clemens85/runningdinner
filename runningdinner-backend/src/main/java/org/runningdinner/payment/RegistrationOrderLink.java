package org.runningdinner.payment;

import javax.persistence.Embeddable;

@Embeddable
public class RegistrationOrderLink {

  private String href;
  
  private String rel;
  
  private String method;
  
  protected RegistrationOrderLink() {
    // NOP
  }

  public RegistrationOrderLink(String href, String rel, String method) {
    this.href = href;
    this.rel = rel;
    this.method = method;
  }

  public String getHref() {
    return href;
  }

  public void setHref(String href) {
    this.href = href;
  }

  public String getRel() {
    return rel;
  }

  public void setRel(String rel) {
    this.rel = rel;
  }

  public String getMethod() {
    return method;
  }

  public void setMethod(String method) {
    this.method = method;
  }

  @Override
  public String toString() {
    return "RegistrationOrderLink [href=" + href + ", rel=" + rel + ", method=" + method + "]";
  }
  
}
