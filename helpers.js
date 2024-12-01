export function isValidID(id) {
    if (!id) throw "Must input id to search for";
    if (typeof id !== 'string') throw "Id must be a string";
    if (id.trim().length === 0) throw "Id cannot be an empty string or just spaces";
    return id.trim();
};