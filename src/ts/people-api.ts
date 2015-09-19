/// <reference path="../../typings/seneca/seneca.d.ts"/>


import * as SENECA from 'seneca';

function api( options ) {

    // restrict the space of user input actions to those that are public
    var valid_actions = { create: 'create', read: 'read', update: 'update', delete: 'delete' }

    this.add( 'role:api,path:people', function( msg, respond ) {
        var action = valid_actions[msg.action];
        if (action) {
            this.act( 'role:people', {
                action: action,
                person: msg.person
            }, respond )
        } else {
            respond(new Error('unknown action=' + msg.action));
        }
    })


    this.add( 'init:api', function( msg, respond ) {
        this.act('role:web', {
            use: {
                prefix: '/api',
                pin:    'role:api,path:*',
                map: {
                    //people: { GET:true, suffix:'/:action' }
                    people: { GET:true, POST: true }
                }
            }
        }, respond )
    })

}


export = api
