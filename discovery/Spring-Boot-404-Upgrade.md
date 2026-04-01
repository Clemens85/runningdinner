## Spring Boot 3.4.3 → 4.0.4 Migration Analysis

### Pre-requisite: Upgrade to 3.5.x first

The official guide mandates stepping up to the latest **3.5.x** before jumping to 4.0, to clear all deprecations that are removed in 4.0.

---

### 1. Java & Platform Requirements

| Item                              | Status                                |
| --------------------------------- | ------------------------------------- |
| Java 17+ required                 | ✅ You're on Java 21 — fine           |
| Kotlin 2.2+ (if used)             | N/A                                   |
| **Jakarta EE 11 / Servlet 6.1**   | ⚠️ bigger jump than EE 10             |
| Spring Framework 7.x co-requisite | Required automatically via parent POM |

The Servlet 6.1 baseline affects the `jakarta.servlet-api` version — Spring Boot's BOM will manage this, but your explicit `jakarta.servlet-api` dependency (no version pinned) will get upgraded automatically. Verify no code relies on removed Servlet 5/6.0 APIs.

---

### 2. Module/Starter Restructuring (HIGH IMPACT)

Spring Boot 4.0 is **heavily modularised**. Every feature now has its own module. Several changes affect your POM directly:

| Current                                 | Action Required                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `spring-boot-starter-web`               | Rename to `spring-boot-starter-webmvc` (old name deprecated)                                                             |
| `flyway-database-postgresql` (bare dep) | **Must add** `spring-boot-starter-flyway` — bare third-party Flyway dep alone is no longer enough                        |
| `spring-boot-starter-test`              | Consider switching to `spring-boot-starter-test-classic` as a migration bridge, then move to tech-specific test starters |

**Quick migration path**: temporarily replace `spring-boot-starter` + `spring-boot-starter-test` with `spring-boot-starter-classic` + `spring-boot-starter-test-classic` to get a "all auto-configs present" classpath, validate it builds, then remove them again and add only the needed starters.

---

### 3. Jackson 2 → Jackson 3 (HIGH IMPACT)

**This is the biggest code change.** Spring Boot 4.0 ships with **Jackson 3** as default, which changed group IDs (`com.fasterxml.jackson` → `tools.jackson`) and renamed several APIs.

**Direct hits in your code:**

| Location                                                   | Current                                                                                       | Must Change To                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------- |
| ApplicationConfig.java                                     | `import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer` | `JsonMapperBuilderCustomizer` |
| ApplicationConfig.java                                     | `Jackson2ObjectMapperBuilderCustomizer jsonCustomizer()`                                      | `JsonMapperBuilderCustomizer` |
| Any use of `@JsonComponent`                                | `@JsonComponent`                                                                              | `@JacksonComponent`           |
| Any use of `@JsonMixin`                                    | `@JsonMixin`                                                                                  | `@JacksonMixin`               |
| Properties `spring.jackson.read.*`                         | Moved to `spring.jackson.json.read.*`                                                         |                               |
| Properties `spring.jackson.write.*`                        | Moved to `spring.jackson.json.write.*`                                                        |                               |
| `SerializationFeature` import from `com.fasterxml.jackson` | Group changes to `tools.jackson.databind`                                                     |                               |

Also check whether **third-party deps** still support Jackson 3: `mailjet-client`, `antisamy`, `logstash-logback-encoder`, Apache POI. If any of them still require Jackson 2, add `spring-boot-jackson2` as a stop-gap.

---

### 4. Flyway (MEDIUM IMPACT)

Your current explicit version is `11.4.0`. Spring Boot 4.0 manages Flyway's version via its BOM — check what version it brings (likely Flyway 11.x or 12.x). Key changes:

- **Add** `spring-boot-starter-flyway` to replace the bare `flyway-database-postgresql` dependency (per the migration guide note).
- The Flyway auto-configuration package moved to `org.springframework.boot.flyway.autoconfigure` — relevant if you have any `FlywayMigrationStrategy` beans or custom `FlywayConfigurationCustomizer`.
- Flyway 11.x requires **PostgreSQL 12+** as the minimum version. Flyway 12.x (if that's what Boot 4 brings) may raise this further — check your PostgreSQL server version.
- If you override `flyway.version` property, verify it remains compatible; you may be able to drop the override and let Boot manage it.

---

### 5. `@EntityScan` Package Change (MEDIUM IMPACT)

ApplicationConfig.java:

```java
// Current
import org.springframework.boot.autoconfigure.domain.EntityScan;

// Spring Boot 4.0
import org.springframework.boot.persistence.autoconfigure.EntityScan;
```

Also: the property `spring.dao.exceptiontranslation.enabled` (if you ever set it) is renamed to `spring.persistence.exceptiontranslation.enabled`.

---

### 6. Testing Changes (HIGH IMPACT)

| Change                                            | Impact on Your Project                                                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MockitoTestExecutionListener` removed            | Check all test classes — use `@ExtendWith(MockitoExtension.class)`                                                                                         |
| `@MockBean`/`@SpyBean` deprecated                 | Migrate to `@MockitoBean`/`@MockitoSpyBean`                                                                                                                |
| `@SpringBootTest` no longer auto-provides MockMVC | Add `@AutoConfigureMockMvc` to affected tests                                                                                                              |
| `TestRestTemplate` needs extra dep                | XssInjectionPreventionTest.java uses it — add `spring-boot-resttestclient` and update import to `org.springframework.boot.resttestclient.TestRestTemplate` |
| `@AutoConfigureMockMvc(webClientEnabled=false)`   | HtmlUnit settings now under `htmlUnit` attribute                                                                                                           |

---

### 7. Very Outdated Dependencies (HIGH RISK)

These have nothing specifically to do with Spring Boot 4 but will likely fail to work with Spring Framework 7 / Jakarta EE 11:

| Dependency                                            | Current Version        | Problem                                                                                                           |
| ----------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `shedlock-spring` + `shedlock-provider-jdbc-template` | **2.1.0** (from ~2019) | Almost certainly incompatible with Spring Framework 7 / Java 21 patterns. Latest is ~6.x. Major migration needed. |
| `wiremock` (`com.github.tomakehurst:wiremock`)        | `3.0.0-beta-1`         | Use stable `org.wiremock:wiremock:3.x` instead.                                                                   |
| `logstash-logback-encoder`                            | `6.2`                  | Current is 8.x; 6.x predates Jakarta EE. Upgrade required.                                                        |
| `com.esotericsoftware.kryo:kryo`                      | `2.22` (~2013)         | Extremely old; should be `com.esotericsoftware:kryo:5.x`.                                                         |
| `com.sun.mail:jakarta.mail`                           | `2.0.1`                | Jakarta EE 11 needs `org.eclipse.angus:angus-mail` (or `jakarta.mail:jakarta.mail-api` 2.1+).                     |

---

### 8. Actuator Changes (LOW IMPACT)

- **Liveness & readiness probes are now enabled by default.** Your `management.endpoint.health.enabled=true` config in application.properties is fine, but expect `/health/liveness` and `/health/readiness` to become active. If you don't want them, add `management.endpoint.health.probes.enabled=false`.
- Actuator package reorganisation: `org.springframework.boot.actuate.*` → `org.springframework.boot.<technology>.actuate.*`.

---

### 9. Other Noteworthy Changes

| Item                                              | Detail                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **DevTools Live Reload**                          | Disabled by default in 4.0. Set `spring.devtools.livereload.enabled=true` to restore.                                       |
| **`spring-boot-starter-tomcat`** (war deployment) | For WAR deployment to external Tomcat, rename to `spring-boot-starter-tomcat-runtime`. For embedded (your case), it's fine. |
| **`spring.aop.proxy-target-class=true`**          | Review — this has been the default since Spring 5 and the explicit setting may be a no-op or conflict.                      |
| **`spring.jpa.open-in-view=true`**                | Still works, but Spring Framework 7 may warn more loudly.                                                                   |
| **`BootstrapRegistry`**                           | Package moved from `org.springframework.boot` to `org.springframework.boot.bootstrap`.                                      |
| **Optional deps in uber jar**                     | No longer included by default — add `<includeOptional>true</includeOptional>` if needed.                                    |
| **`spring-boot-properties-migrator`**             | Add as a temporary `runtime` dependency to get warnings for renamed properties at startup.                                  |

---

### Recommended Migration Order

1. Upgrade to **Spring Boot 3.5.x** first, fix all deprecation warnings. => _DONE_
2. Bump `spring-boot-starter-parent` to `4.0.4`. => _DONE_
3. Add `spring-boot-starter-classic` + `spring-boot-starter-test-classic` temporarily to get a compiling baseline. => _DONE_
4. Fix **ShedLock** (2.1.0 → 6.x) — this likely needs a code change to the `LockProvider` setup in ApplicationConfig.java. => _DONE_
5. Fix **Jackson** (`Jackson2ObjectMapperBuilderCustomizer` → `JsonMapperBuilderCustomizer`), update all Jackson imports. => _DONE_
6. Fix **`@EntityScan`** import. => _DONE_
7. Migrate tests (`@MockBean` → `@MockitoBean`, add `@AutoConfigureMockMvc`, fix `TestRestTemplate`). => _DONE_
8. Replace `spring-boot-starter-web` → `spring-boot-starter-webmvc`, add `spring-boot-starter-flyway`. => _DONE_
9. Upgrade `wiremock`, `logstash-logback-encoder`, `kryo`, `jakarta.mail`. => _DONE_
10. Remove the classic starters once everything is green. => _DONE_
11. Add `spring-boot-properties-migrator` temporarily to catch any remaining property renames. => _DONE_
