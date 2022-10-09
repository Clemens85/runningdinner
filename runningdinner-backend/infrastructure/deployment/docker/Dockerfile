FROM openjdk:8-jdk-alpine
ARG EXTRACTED=target/extracted
COPY ${EXTRACTED}/dependencies/ ./
COPY ${EXTRACTED}/spring-boot-loader/ ./
COPY ${EXTRACTED}/snapshot-dependencies/ ./
COPY ${EXTRACTED}/application/ ./
ENTRYPOINT ["java",  "-Dspring.profiles.active=dev", "org.springframework.boot.loader.JarLauncher"]