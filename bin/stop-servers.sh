#!/bin/sh


pid=`ps aux | grep 'node generated/server/server/src/ts/server.js' | grep -v grep | awk '{ print $2 }'`
if [ -z "$pid" ]
then
    # echo "WARNING: people-server is not running"
    true;
else
    # echo "INFO: killing people-server"
    kill -15 $pid
fi

sleep 1

exit 0
