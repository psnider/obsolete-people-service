#!/bin/sh

line=`ps aux | grep 'node people-pin-service' | grep -v grep`
if [ -z "$line" ]
then
    echo "INFO: starting people-pin-service"
    node people-pin-service.js &
else
    echo "WARNING: people-pin-service is already running"
fi

line=`ps aux | grep 'node people-app' | grep -v grep`
if [ -z "$line" ]
then
    echo "INFO: starting people-app"
    node people-app.js &
else
    echo "WARNING: people-app is already running"
fi

sleep 1

exit 0
