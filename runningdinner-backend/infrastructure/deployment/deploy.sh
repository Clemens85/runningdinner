#!/usr/bin/env bash

set -x

UPLOAD_DIR=${HOME}/upload
APP_DIR=${HOME}/runningdinner

mkdir -p $APP_DIR/html

cd $UPLOAD_DIR
tar -xvzf runningdinner.tar.gz
chmod +x runningdinner-2.0.0.jar
chmod +x deploy.sh

mkdir -p html_tmp
unzip runningdinner-2.0.0.jar 'BOOT-INF/classes/static/*' -d html_tmp/

rm -rf $APP_DIR/html/*
mv html_tmp/BOOT-INF/classes/static/* $APP_DIR/html/
rm -rf html_tmp/

kill $(cat $APP_DIR/application.pid)

cp $APP_DIR/runningdinner-2.0.0.jar $APP_DIR/runningdinner-2.0.0.jar.bak
cp $APP_DIR/server.log $APP_DIR/server.log.bak
rm $APP_DIR/runningdinner-2.0.0.jar
rm $APP_DIR/server.log

mv $UPLOAD_DIR/runningdinner-2.0.0.jar $APP_DIR/runningdinner-2.0.0.jar

cd $APP_DIR
nohup java -jar -Dspring.profiles.active=prod runningdinner-2.0.0.jar >/dev/null 2>&1 &
# Use this as a fallback if we need to switch back to angularjs
# nohup java -jar -Dspring.profiles.active=prod,angularjs runningdinner-2.0.0.jar >/dev/null 2>&1 &

sleep 25s

echo $(curl -XGET http://localhost:9090/health)
