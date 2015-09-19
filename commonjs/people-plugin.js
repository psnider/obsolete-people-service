/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/seneca/seneca.d.ts"/>
/// <reference path="../../typings/people-service/people-plugin.d.ts"/>
/// <reference path="../../typings/people-service/people-protocol.d.ts"/>
// Assume express is using validation of the msg via json-schema
function people(options) {
    var _this = this;
    var seneca = this;
    seneca.add('init:people', init);
    function init(msg, done) {
        done();
    }
    function idHasCorrectForm(msg) {
        return (('person' in msg) && ('id' in msg.person) && (msg.person.id != null) && (msg.person.id.length > 0));
    }
    // These actions are done before these calls
    // - validate against schema
    // - authorize
    seneca.add('role:people,action:create', function (msg, done) {
        var person = msg.person;
        if ('id' in person) {
            var response = { error: new Error('person.id isnt allowed for create') };
            done(null, response);
        }
        else {
            _this.make('person').save$(person, function (error, created_person) {
                if (error) {
                    done(error);
                }
                else {
                    var response = { person: created_person };
                    done(null, response);
                }
            });
        }
    });
    seneca.add('role:people,action:read', function (msg, done) {
        if (!idHasCorrectForm(msg)) {
            var response = { error: new Error('person.id was not set or is invalid') };
            done(null, response);
        }
        else {
            var id = msg.person.id;
            _this.make('person').load$(id, function (error, read_person) {
                if (error) {
                    done(error);
                }
                else {
                    var response;
                    if (read_person == null) {
                        response = { error: new Error('no person for id=' + id) };
                    }
                    else {
                        response = { person: read_person };
                    }
                    done(null, response);
                }
            });
        }
    });
    seneca.add('role:people,action:update', function (msg, done) {
        if (!idHasCorrectForm(msg)) {
            var response = { error: new Error('person.id was not set or is invalid') };
            done(null, response);
        }
        else {
            var id = msg.person.id;
            var person = _this.make('person').load$(id, function (error, read_person) {
                if (error) {
                    done(error);
                }
                else {
                    var response;
                    if (read_person == null) {
                        response = { error: new Error('no person for id=' + id) };
                        done(null, response);
                    }
                    else {
                        person.save$(msg.person, function (error, updated_person) {
                            if (error) {
                                done(error);
                            }
                            else {
                                response = { person: updated_person };
                                done(null, response);
                            }
                        });
                    }
                }
            });
        }
    });
    seneca.add('role:people,action:delete', function (msg, done) {
        if (!idHasCorrectForm(msg)) {
            var response = { error: new Error('person.id was not set or is invalid') };
            done(null, response);
        }
        else {
            var id = msg.person.id;
            _this.make('person').remove$(id, function (error) {
                if (error) {
                    done(error);
                }
                else {
                    var response = { person: null };
                    done(null, response);
                }
            });
        }
    });
}
module.exports = people;
