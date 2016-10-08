declare namespace Person {

    type DatabaseObjectID = string;
    type URL = string;


    interface Name {
        family?: string;
        given?: string;
        additional?: string;
    }


    type ContactMethodType = 'mobile' | 'phone' | 'twitter'
    interface ContactMethod {
        method?: string;
        address?: string;
        display_name?: string
    }


    interface Location {
        lat:       Number,
        lng:       Number,
        when?:      Date
    }


    export interface Person {
        // NOTE: leading underscore indicates this is special, in this case, not set by user
        _id?:               DatabaseObjectID;
        _test_only?:        boolean;
        account_email?:     string;
        account_status?:    string;
        name?:              Name;
        locale?:            string;
        time_zone?:         string;
        role?:              string;
        contact_methods?:   ContactMethod[];
        last_known_loc?:    Location;
        profile_pic_urls?:  URL[];
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
