package org.runningdinner.payment.paymentoptions.rest;

import java.util.UUID;

import jakarta.validation.Valid;

import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/paymentoptionsservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class PaymentOptionsServiceRest {

  private PaymentOptionsService paymentOptionsService;

  public PaymentOptionsServiceRest(PaymentOptionsService paymentOptionsService) {
    this.paymentOptionsService = paymentOptionsService;
  }
  
  @GetMapping(value = "/runningdinner/{adminId}")
  public PaymentOptions getPaymentOptions(@PathVariable String adminId) {
    
    return paymentOptionsService.findPaymentOptionsByAdminId(adminId)
            .orElse(null);
  }  
  
  @PostMapping(value = "/runningdinner/{adminId}")
  public PaymentOptions createPaymentOptions(@PathVariable String adminId, @RequestBody @Valid PaymentOptions paymentOptions) {
    
    return paymentOptionsService.createPaymentOptions(adminId, paymentOptions);
  }  
  
  @PutMapping(value = "/runningdinner/{adminId}/{paymentOptionsId}")
  public PaymentOptions updatePaymentOptions(@PathVariable String adminId,
                                             @PathVariable UUID paymentOptionsId,
                                             @RequestBody @Valid PaymentOptions paymentOptions) {
    
    return paymentOptionsService.updatePaymentOptions(adminId, paymentOptionsId, paymentOptions);
  }
  
  @DeleteMapping(value = "/runningdinner/{adminId}/{paymentOptionsId}")
  public void deletePaymentOptions(@PathVariable String adminId,
                                   @PathVariable UUID paymentOptionsId) {
    
    paymentOptionsService.deletePaymentOptions(adminId, paymentOptionsId);
  }
}
