package org.payment.paypal;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AccessTokenResponseTO {
  
    private String scope;
    
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("token_type")
    private String tokenType;
    
    @JsonProperty("app_id")
    private String applicationId;
    
    @JsonProperty("expires_in")
    private int expiresIn;
    
    private String nonce;
    
    @JsonIgnore
    private Instant expiration;

    public String getScope() {
      return scope;
    }

    public void setScope(String scope) {
      this.scope = scope;
    }

    public String getAccessToken() {
      return accessToken;
    }

    public void setAccessToken(String accessToken) {
      this.accessToken = accessToken;
    }

    public String getTokenType() {
      return tokenType;
    }

    public void setTokenType(String tokenType) {
      this.tokenType = tokenType;
    }

    public String getApplicationId() {
      return applicationId;
    }

    public void setApplicationId(String applicationId) {
      this.applicationId = applicationId;
    }

    public int getExpiresIn() {
      return expiresIn;
    }

    public void setExpiresIn(int expiresIn) {
      this.expiresIn = expiresIn;
    }

    public String getNonce() {
      return nonce;
    }

    public void setNonce(String nonce) {
      this.nonce = nonce;
    }

    public Instant getExpiration() {
      return expiration;
    }

    public void setExpiration(Instant expiration) {
      this.expiration = expiration;
    }
    
    
}