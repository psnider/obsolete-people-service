#!/bin/sh

pid=`ps aux | grep 'node people-pin-service' | grep -v grep | awk '{ print $2 }'`
if [ -z "$pid" ]
then
    echo "WARNING: people-pin-service is not running"
else
    echo "INFO: killing people-pin-service"
    kill -9 $pid
fi

pid=`ps aux | grep 'node people-app' | grep -v grep | awk '{ print $2 }'`
if [ -z "$pid" ]
then
    echo "WARNING: people-app is not running"
else
    echo "INFO: killing people-app"
    kill -9 $pid
fi

sleep 1

exit 0
