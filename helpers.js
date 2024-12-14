export function isValidID(id) {
    if (!id) throw "Must input id to search for";
    if (typeof id !== 'string') throw "Id must be a string";
    if (id.trim().length === 0) throw "Id cannot be an empty string or just spaces";
    return id.trim();
};

const Handlebars = require('hbs');

//Helper to format release dates
Handlebars.registerHelper('formatDate', function (dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
});