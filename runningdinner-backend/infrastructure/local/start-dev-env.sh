#!/usr/bin/env bash
docker-compose up -d
sleep 2s
docker exec -d db bash /docker-entrypoint-initdb.d/init-db.sh
# docker exec -it db bash