#!/bin/bash

if [[  "$1" == "--log"  ||  "$2" == "--log"  ]]; then
    do_log=true
else
    do_log=false
fi
if [[  "$1" == "--save"  ||  "$2" == "--save"  ]]; then
    save_to_file=true
    timestamp=`date "+%b_%d_%H:%M:%S"`
    log_suffix=${timestamp}.log
else
    save_to_file=false
fi

line=`ps aux | grep 'node generated/server/server/src/ts/people-server.js' | grep -v grep`
if [[ -z "$line" ]];then
    if [[ $do_log == true ]];then
        if [[ $save_to_file == true ]];then
            redirect="&>logs/people.${log_suffix}"
        fi
    fi
    cmd="node generated/server/server/src/ts/people-server.js $log_arg $redirect &"
    # echo "INFO: $cmd"
    eval $cmd
else
    echo "WARNING: people-server is already running"
fi

sleep 1

exit 0
