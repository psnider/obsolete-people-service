type DatabaseObjectID = string;
type URL = string;


export interface Name {
    family?: string;
    given?: string;
    additional?: string;
}


export type ContactMethodType = 'mobile' | 'phone' | 'twitter'
export interface ContactMethod {
    method?: string;
    address?: string;
    display_name?: string
}


export interface Location {
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
export function getFullName(locale: string, name: Name) : string


// Convert any object fields that are JSON strings back into objects
export function convertJSONToObject(person: Person) : void

