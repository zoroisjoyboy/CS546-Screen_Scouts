export function isValidID(id) {
    if (!id) throw "Must input id to search for";
    if (typeof id !== 'string') throw "Id must be a string";
    if (id.trim().length === 0) throw "Id cannot be an empty string or just spaces";
    if (!ObjectId.isValid(id.trim())) throw `${id} is invalid object ID`;
    return id.trim();
};

export function isVaidString(value, varName) {
    if (typeof value !== 'string' || value.trim().length === 0) throw `${varName} must be a valid non-empty string`;
    return value.trim();
}

export function isValidDate(gameDate) {
    const dateFormat = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateFormat.test(gameDate)) {
      throw "Date format should be mm/dd/yyyy."
    }
    const [month, day, year] = gameDate.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() != year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      throw `{gameDate} is invalid. Provide a valid date.`;
    }
    return gameDate;  
}