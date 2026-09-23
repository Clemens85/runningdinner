package org.runningdinner;

import io.micrometer.cloudwatch2.CloudWatchConfig;
import io.micrometer.cloudwatch2.CloudWatchMeterRegistry;
import io.micrometer.core.instrument.Clock;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.config.MeterFilter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.micrometer.metrics.autoconfigure.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import software.amazon.awssdk.services.cloudwatch.CloudWatchAsyncClient;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.Set;

/**
 * Spring Boot has no built-in CloudWatch metrics-export auto-configuration (unlike Atlas/
 * Dynatrace/Stackdriver/...) - that's normally provided by Spring Cloud AWS - so the
 * CloudWatchMeterRegistry is wired up manually here. Export is restricted to a curated,
 * low-cardinality allow-list: the aggregate JVM heap gauges registered below, plus Boot's already
 * auto-registered "jvm.threads.live" and "hikaricp.connections.*" gauges. Everything else
 * Boot/Micrometer auto-instruments (per-pool jvm.memory.*, jvm.gc.*, tomcat.*, ...) is denied so it
 * never reaches CloudWatch and blows through the free tier of 10 custom metrics.
 */
@Configuration
public class MetricsConfig {

  // Micrometer's own documented prefix - NOT Boot's convention of management.<system>.metrics.export used by first-party exporters:
  private static final String EXPORT_PROPERTY_PREFIX = "management.metrics.export.cloudwatch";

  private static final Set<String> CLOUDWATCH_ALLOWED_METRICS = Set.of(
      "jvm.heap.used",
      "jvm.heap.max",
      "jvm.threads.live",
      "hikaricp.connections.active",
      "hikaricp.connections.idle",
      "hikaricp.connections.pending"
  );

  @Bean
  // CloudWatchAsyncClient.create() eagerly resolves the AWS region and would fail context startup
  // wherever no AWS config exists (local dev, CI) unless export is actually enabled.
  @ConditionalOnProperty(prefix = EXPORT_PROPERTY_PREFIX, name = "enabled", havingValue = "true", matchIfMissing = true)
  public CloudWatchAsyncClient cloudWatchAsyncClient() {

    // Region/credentials are resolved through the default AWS provider chain (ECS task role, AWS_REGION env var)
    return CloudWatchAsyncClient.create();
  }

  @Bean
  @ConditionalOnProperty(prefix = EXPORT_PROPERTY_PREFIX, name = "enabled", havingValue = "true", matchIfMissing = true)
  public CloudWatchMeterRegistry cloudWatchMeterRegistry(Environment environment, Clock clock, CloudWatchAsyncClient cloudWatchAsyncClient) {

    // CloudWatchConfig.get(key) is called with keys already prefixed by "cloudwatch." (e.g. "cloudwatch.namespace"):
    CloudWatchConfig cloudWatchConfig = key -> environment.getProperty("management.metrics.export." + key);
    return new CloudWatchMeterRegistry(cloudWatchConfig, clock, cloudWatchAsyncClient);
  }

  @Bean
  public MeterRegistryCustomizer<CloudWatchMeterRegistry> cloudWatchMeterFilter() {

    return registry -> registry.config().meterFilter(MeterFilter.denyUnless(id -> CLOUDWATCH_ALLOWED_METRICS.contains(id.getName())));
  }

  // Registered via a customizer (not a constructor-injected MeterRegistry) to avoid a circular
  // dependency with the MeterRegistryPostProcessor that builds the registries in the first place.
  @Bean
  public MeterRegistryCustomizer<MeterRegistry> heapGauges() {

    MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
    return registry -> {
      // Micrometer's built-in jvm.memory.used is broken down per memory pool with no aggregate total, so read it directly:
      Gauge.builder("jvm.heap.used", memoryMXBean, mx -> mx.getHeapMemoryUsage().getUsed())
          .baseUnit("bytes")
          .description("Used JVM heap memory (aggregated across all memory pools)")
          .register(registry);
      Gauge.builder("jvm.heap.max", memoryMXBean, mx -> mx.getHeapMemoryUsage().getMax())
          .baseUnit("bytes")
          .description("Max JVM heap memory")
          .register(registry);
    };
  }
}
