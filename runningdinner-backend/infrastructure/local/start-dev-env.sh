#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1

# Gets only the IP of the docker host:
dockerHostIp=($(docker run nginx getent hosts host.docker.internal))
# (Over-)write .env docker compose file:
echo "DOCKER_HOST_IP=$dockerHostIp" > .env

docker-compose up -d
sleep 2s
docker exec -d db bash /docker-entrypoint-initdb.d/init-db.sh
# docker exec -it db bash