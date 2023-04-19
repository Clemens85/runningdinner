FROM openjdk:8-jdk-alpine
ARG EXTRACTED=target/extracted
ENV SPRING_PROFILES_ACTIVE=prod
COPY ${EXTRACTED}/dependencies/ ./
COPY ${EXTRACTED}/spring-boot-loader/ ./
COPY ${EXTRACTED}/snapshot-dependencies/ ./
RUN true
COPY ${EXTRACTED}/application/ ./
RUN mkdir -p /logs
ENTRYPOINT ["java",  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE}", "org.springframework.boot.loader.JarLauncher"]