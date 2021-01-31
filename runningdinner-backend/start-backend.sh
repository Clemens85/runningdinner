#!/bin/bash
jarfile=target/runningdinner-2.0.0.jar
if [ ! -f "$jarfile" ]; then
  ./mvnw package -DskipTests
fi
java -jar -Dspring.profiles.active=dev,demodinner $jarfile

