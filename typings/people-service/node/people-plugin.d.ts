declare module "people-plugin" {

    import SENECA               = require('seneca');


    // interface Request extends SENECA.MinimalPattern {
    //     request: PeopleProtocol.Request;
    // }


    interface Options {
        default_locale: string;
    }

}
