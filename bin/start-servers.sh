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

line=`ps aux | grep 'node people-pin-service' | grep -v grep`
if [[ -z "$line" ]];then
    if [[ $do_log == true ]];then
        log_arg="--seneca.log=plugin:people"
        if [[ $save_to_file == true ]];then
            redirect="&>log/people.${log_suffix}"
        fi
    fi
    cmd="node generated/commonjs/people-pin-service.js $log_arg $redirect &"
    # echo "INFO: $cmd"
    eval $cmd
else
    echo "WARNING: people-pin-service is already running"
fi

line=`ps aux | grep 'node people-app' | grep -v grep`
if [[ -z "$line" ]];then
    if [[ $do_log == true ]];then
        log_arg="--seneca.log=plugin:web,plugin:api"
        if [[ $save_to_file == true ]];then
            redirect="&>log/api.${log_suffix}"
        fi
    fi
    cmd="node generated/commonjs/people-app.js $log_arg $redirect &"
    # echo "INFO: $cmd"
    eval $cmd
else
    echo "WARNING: people-app is already running"
fi

sleep 1

exit 0
