import { ObjectId } from 'mongodb';

let exportedMethods = {
  isValidID(id) {
      if (!id) throw "Must input id to search for";
      if (typeof id !== 'string') throw "Id must be a string";
      if (id.trim().length === 0) throw "Id cannot be an empty string or just spaces";
      if (!ObjectId.isValid(id.trim())) throw `${id} is invalid object ID`;
      return id.trim();
  },

  isValidString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
    throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  isValidDate(dateString) {
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
    if (!dateRegex.test(dateString)) {
        throw "Invalid date format. Expected format is yyyy-mm-dd";
    }
    const inputDate = new Date(dateString);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
        throw "Date cannot be in the future";
    }
    return dateString;
},

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    email = email.trim();
    if (email.length === 0)
      throw "Error: Email cannot be an empty string or string with just spaces";
    if (!isNaN(email))
      throw `Error: Email is not a valid as it only contains digits`;
    if (!emailRegex.test(email))
      throw `Error: ${email} is not a valid email`;
    return email;
  },

  checkPassword(passValue) {
    return /[A-Z]/.test(passValue) && /\d/.test(passValue) && /[!@#$%^&*(),.?":{}|<>]/.test(passValue);
  }
};

export default exportedMethods;
