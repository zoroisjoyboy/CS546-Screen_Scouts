import {ObjectId} from 'mongodb';

const exportedMethods = {
  checkId(id) {
    if (!id) throw 'Error: You must provide an id to search for';
    if (typeof id !== 'string') throw 'Error: id must be a string';
    id = id.trim();
    if (id.length === 0)
      throw 'Error: id cannot be an empty string or just spaces';
    if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
},

checkNumber(value, varName) {
  if (typeof value !== 'number' || isNaN(value))
    throw `Error: ${varName} must be a valid number.`;
  return value;
},

checkDate(date, varName) {
  if (!date || isNaN(Date.parse(date))) 
    throw `Error: ${varName} must be a valid date.`;
  return new Date(date);
},
};

export default exportedMethods;