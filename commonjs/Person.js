/// <reference path='../../../typings/people-service/Person.d.ts' />
// return the concatenation of name.given name.family
// Returns null if none of those three are set.
function getFullName(locale, name) {
    function getNameComponents(components) {
        return components.filter(function (component) { return (component != null); });
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
exports.getFullName = getFullName;
function convertJSONToObject(person) {
    if (person.last_known_loc != null) {
        if (person.last_known_loc.when != null) {
            person.last_known_loc.when = new Date(person.last_known_loc.when.toString());
        }
    }
}
exports.convertJSONToObject = convertJSONToObject;
