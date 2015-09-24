/// <reference path='../../../typings/people-service/Person.d.ts' />



// return the concatenation of name.given name.family
// Returns null if none of those three are set.
export function getFullName(locale: string, name : Person.Name) : string {
    function getNameComponents(components) {
        return components.filter((component) => {return (component != null);});
    }
    switch (locale) {
    case 'en_US':
    case 'es_US':
    case 'fr_FR':
        return getNameComponents([name.given, name.family]).join(' ');
        break;
    case 'ja_JP':
        return getNameComponents([name.family, name.given]).join(' ');
        break;
    default:
        throw new Error('localizePersonName doesnt support locale=' + locale);
        break;
    }
    return null;
}


export function convertJSONToObject(person: Person.Person) : void {
    if (person.last_known_loc != null) {
        if (person.last_known_loc.when != null) {
            person.last_known_loc.when = new Date(person.last_known_loc.when.toString())
        }
    }
}
