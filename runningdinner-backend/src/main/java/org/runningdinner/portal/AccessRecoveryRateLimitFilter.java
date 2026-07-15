package org.runningdinner.portal;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Servlet filter that rate-limits the access-recovery endpoint (POST /rest/participant-portal/v1/access-recovery)
 * on a per-client-IP basis using the Bucket4j token-bucket algorithm.
 *
 *
 * <h3>Memory safety</h3>
 * Buckets are stored in a Guava {@link Cache} bounded by {@value #MAX_CACHE_SIZE} entries and
 * evicted after refillPeriodMinutes minutes of inactivity, preventing unbounded memory
 * growth under IP-spoofing or distributed-attack scenarios.
 *
 * <h3>IP detection behind AWS CloudFront</h3>
 * CloudFront forwards the real viewer IP in the {@code CloudFront-Viewer-Address} header
 * (format: {@code <ip>:<port>}). This header is set by CloudFront itself and cannot be forged
 * by the client once the request passes through CloudFront.  When this header is absent (e.g.
 * local dev / direct access), the filter falls back to the first entry of {@code X-Forwarded-For}
 * and finally to {@link HttpServletRequest#getRemoteAddr()}.
 */
public class AccessRecoveryRateLimitFilter implements Filter {

  private static final Logger LOGGER = LoggerFactory.getLogger(AccessRecoveryRateLimitFilter.class);

  /**
   * Maximum number of distinct IPs tracked simultaneously.
   * Oldest / least-recently-used entries are evicted once this limit is reached.
   */
  private static final long MAX_CACHE_SIZE = 4_000;

  /**
   * Header set by CloudFront containing the real viewer address in {@code <ip>:<port>} format.
   * This is the most reliable source when the application is behind CloudFront.
   */
  private static final String CLOUDFRONT_VIEWER_ADDRESS_HEADER = "CloudFront-Viewer-Address";

  private static final String X_FORWARDED_FOR_HEADER = "X-Forwarded-For";

  private final Cache<String, Bucket> bucketsByIp;

  private final int capacity;
  private final int refillPeriodMinutes;

  public AccessRecoveryRateLimitFilter(int capacity, int refillPeriodMinutes) {
    this.capacity = capacity;
    this.refillPeriodMinutes = refillPeriodMinutes;
    this.bucketsByIp = CacheBuilder.newBuilder()
        .maximumSize(MAX_CACHE_SIZE)
        .expireAfterAccess(refillPeriodMinutes, TimeUnit.MINUTES)
        .build();
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
      throws IOException, ServletException {

    if (!(servletRequest instanceof HttpServletRequest request)) {
      chain.doFilter(servletRequest, servletResponse);
      return;
    }

    String clientIp = resolveClientIp(request);
    Bucket bucket;
    try {
      bucket = bucketsByIp.get(clientIp, this::buildBucket);
    } catch (ExecutionException e) {
      // buildBucket never throws — this cannot happen in practice
      LOGGER.error("Failed to initialise rate-limit bucket for IP {}", clientIp, e);
      throw new ServletException("Failed to initialise rate-limit bucket", e);
    }

    if (bucket.tryConsume(1)) {
      chain.doFilter(servletRequest, servletResponse);
    } else {
      LOGGER.warn("Rate limit exceeded for access-recovery request from IP {}", clientIp);
      HttpServletResponse response = (HttpServletResponse) servletResponse;
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Resolves the real client IP address, preferring CloudFront-specific headers.
   *
   * <ol>
   *   <li>{@code CloudFront-Viewer-Address} — set by CloudFront, cannot be forged by the client</li>
   *   <li>First entry of {@code X-Forwarded-For} — leftmost IP is the originating client</li>
   *   <li>{@link HttpServletRequest#getRemoteAddr()} — direct connection (local dev, no proxy)</li>
   * </ol>
   */
  static String resolveClientIp(HttpServletRequest request) {
    // CloudFront-Viewer-Address: "1.2.3.4:12345"  — strip port
    String cfViewerAddress = request.getHeader(CLOUDFRONT_VIEWER_ADDRESS_HEADER);
    if (StringUtils.isNotBlank(cfViewerAddress)) {
      int colonIdx = cfViewerAddress.lastIndexOf(':');
      String clientIpFromCloudFront = cfViewerAddress;
      if (colonIdx > 0) {
        clientIpFromCloudFront = cfViewerAddress.substring(0, colonIdx);
      }
      LOGGER.info("Resolved client IP from CloudFront {}", clientIpFromCloudFront);
      return clientIpFromCloudFront;
    }

    // X-Forwarded-For: "client, proxy1, proxy2" — take the leftmost entry
    String xff = request.getHeader(X_FORWARDED_FOR_HEADER);
    if (StringUtils.isNotBlank(xff)) {
      int commaIdx = xff.indexOf(',');
      String clientIpFromXff = (commaIdx > 0 ? xff.substring(0, commaIdx) : xff).strip();
      LOGGER.info("Resolved client IP from X-Forwarded-For {}", clientIpFromXff);
      return clientIpFromXff;
    }

    String clientIp = request.getRemoteAddr();
    LOGGER.info("Resolved client IP from remote address as fallback {}", clientIp);
    return clientIp;
  }

  private Bucket buildBucket() {
    Bandwidth limit = Bandwidth.builder()
        .capacity(capacity)
        .refillGreedy(capacity, Duration.ofMinutes(refillPeriodMinutes))
        .build();
    return Bucket.builder()
        .addLimit(limit)
        .build();
  }
}
