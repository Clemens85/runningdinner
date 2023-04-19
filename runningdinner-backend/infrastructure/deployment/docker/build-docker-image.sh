#!/bin/bash

set +e

CUR_DIR=$(pwd)

cd "$( dirname "${BASH_SOURCE[0]}" )/../../.." || exit 1

./mvnw package -DskipTests

java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted/

docker build -f infrastructure/deployment/docker/Dockerfile -t clemensstich/runyourdinner .

cd "$CUR_DIR" || exit 1

