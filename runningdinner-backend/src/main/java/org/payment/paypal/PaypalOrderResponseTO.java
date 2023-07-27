package org.payment.paypal;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PaypalOrderResponseTO {

  private String id;

  private PaypalOrderStatus status;

  private List<LinkTO> links;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public PaypalOrderStatus getStatus() {
    return status;
  }

  public void setStatus(PaypalOrderStatus status) {
    this.status = status;
  }

  public List<LinkTO> getLinks() {
    return links;
  }

  public void setLinks(List<LinkTO> links) {
    this.links = links;
  }

}
