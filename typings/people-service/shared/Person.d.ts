declare namespace Person {

    type DatabaseObjectID = string;
    type SHA1 = string;


    interface Name {
        family?: string;
        given?: string;
        additional?: string;
    }


    interface ContactMethod {
        method?: string;
        address?: string;
    }


    interface Location {
        lat:       Number,
        lng:       Number,
        when?:      Date
    }


    export interface Person {
        // NOTE: leading underscore indicates this is special, in this case, not set by user
        _id?:               DatabaseObjectID;
        account_email?:     string;
        account_status?:    string;
        name?:              Name;
        locale?:            string;
        time_zone?:         string;
        role?:              string;
        contact_methods?:   ContactMethod[];
        last_known_loc?:    Location;
        profile_pic_sha1?:  SHA1;
    }


    // return the concatenation of name.given name.family
    // Returns null if none are set.
    function getFullName(locale: string, name: Name) : string


    // Convert any object fields that are JSON strings back into objects
    function convertJSONToObject(person: Person.Person) : void
}

declare module 'Person' {
    export = Person
}
