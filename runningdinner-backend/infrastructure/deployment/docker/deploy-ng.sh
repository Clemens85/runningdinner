#!/usr/bin/env bash

set -x

UPLOAD_DIR=${HOME}/upload
APP_DIR=${HOME}/runningdinner
DOCKER_COMPOSE_DIR="$APP_DIR/docker-compose"

mkdir -p "$DOCKER_COMPOSE_DIR"

cd "$UPLOAD_DIR" || exit 1
tar -xvzf runningdinner.tar.gz
# TODO exctract do subfolder so that deploy.sh script can be safely executed

# Backup old folder:
mkdir -p "$APP_DIR/docker-compose-backup"
rm -rf "$APP_DIR/docker-compose-backup"
cp "$DOCKER_COMPOSE_DIR" "$APP_DIR/docker-compose-backup"

# TODO check command (this does actual a mv * )
cp "$UPLOAD_DIR/*" "$DOCKER_COMPOSE_DIR"
rm -rf "${UPLOAD_DIR:?}/"*

cd "$DOCKER_COMPOSE_DIR" || exit 1

./fetch-credentials.sh

docker-compose up -d

sleep 35s

echo $(curl -XGET http://localhost:9090/health)





