#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1

# Gets only the IP of the docker host:
# This does not seem to work on Linux (but probably on Windows systems):
# dockerHostIp=($(docker run nginx getent hosts host.docker.internal))

# Use this one instead for Linux:
# dockerHostIp=$(docker network inspect local_default)
# This retrieves a JSON and we need to parse out [0].IPAM.Config.Gateway... this is a poor man's crappy solution for it... Better would be to use something like jq:
dockerHostIp=$(docker network inspect local_default | grep -o '"Gateway": "[^"]*' | grep -o '[^"]*$')

# (Over-)write .env docker compose file:
echo "DOCKER_HOST_IP=$dockerHostIp" > .env

docker-compose up -d
sleep 2s
docker exec -d db bash /docker-entrypoint-initdb.d/init-db.sh
# docker exec -it db bash

# dockerHostIp="172.18.0.1"