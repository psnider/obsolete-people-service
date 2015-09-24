#!/bin/sh

line=`ps aux | grep 'node people-pin-service' | grep -v grep`
if [ -z "$line" ]
then
    if [ "$1" == "--log" ]
    then
        log_arg="--seneca.log=plugin:people"
    fi
    echo "INFO: src/server/js/people-pin-service.js $log_arg"
    node src/server/js/people-pin-service.js $log_arg &
else
    echo "WARNING: people-pin-service is already running"
fi

line=`ps aux | grep 'node people-app' | grep -v grep`
if [ -z "$line" ]
then
    if [ "$1" == "--log" ]
    then
        log_arg="--seneca.log=plugin:web,plugin:api"
    fi
    echo "INFO: src/server/js/people-app.js $log_arg"
    node src/server/js/people-app.js $log_arg &
else
    echo "WARNING: people-app is already running"
fi

sleep 1

exit 0
