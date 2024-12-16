// user methods to getting user info and updating user info in db
import helpers from "../helpers.js";
import { format } from "date-fns";
import { users } from "../config/mongoCollections.js";
import bcrypt from 'bcrypt';
import { ObjectId } from "mongodb";

export const signUpUser = async (
  email,
  firstName,
  lastName,
  userName,
  password,
  birthday,
  profilePic
) => {

  if (!email) throw "An email must be provided";
  if (!firstName) throw "A first name must be provided";
  if (!lastName) throw "A last name must be provided";
  if (!userName) throw "A userId must be provided";
  if (!password) throw "A password must be provided";
  if (!birthday) throw "A favorite quote must be provided";
  if (!profilePic) throw "Profile pic must be provided";
  
  email = helpers.isValidEmail(email, "Email");
  firstName = helpers.isValidString(firstName, "First Name");
  lastName = helpers.isValidString(lastName, "Last Name");
  userName = helpers.isValidString(userName, "Username");
  password = helpers.isValidString(password, "Password");
  birthday = helpers.isValidDate(birthday);
  
  if (firstName.length < 0 || firstName.length > 25 || /\d/.test(firstName)) throw `${firstName} is not a valid first name. It must be 0-25 characters long and cannot contain numbers`;
  if (lastName.length < 0 || lastName.length > 25 || /\d/.test(lastName)) throw `${lastName} is not a valid last name. It must be 0-25 characters long and cannot contain numbers`;
  if (userName.length < 5 || userName.length > 20 || /\d/.test(userName)) throw `${userName} is not a valid username. It must be 5-20 characters long and cannot contain numbers.`;
  if (password.length < 8 || !helpers.checkPassword(password)) throw `${password} is not a valid password. There needs to be at least one uppercase character, there has to be at least one number and there has to be at least one special character`;

  const userCollection = await users();

  userName = userName.toLowerCase();
  email = email.toLowerCase();
  const existingUserName = await userCollection.findOne({ userName });
  if (existingUserName) {
      throw "There is already a user with that username";
  }
  const existingUserEmail = await userCollection.findOne({ email });
  if (existingUserEmail) {
      throw "There is already a user with that email";
  }
  
  const saltRounds = 10;
  password = await bcrypt.hash(password, saltRounds);

  const newUserObj = {
    email,
    firstName,
    lastName,
    userName,
    password,
    birthday,
    profilePic,
    watchlist: [],
    watchedlist: [],
    userReviews: [],
    userComments: [],
    creationDate: new Date()
  };

  const insertUser = await userCollection.insertOne(newUserObj);
  if (!insertUser.acknowledged || !insertUser.insertedId) {
    return {registrationCompleted: false};
  } else {
    return {registrationCompleted: true};
  }
};

export const signInUser = async (userName, password) => {
  if (!userName) throw "Error: You must supply a Username!";
  if (!password) throw "Error: You must supply a Password!";

  userName = helpers.isValidString(userName, "Username");
  password = helpers.isValidString(password, "Password");

  if (userName.length < 5 || userName.length > 20 || /\d/.test(userName)) {
    throw `${userName} is not a valid username. It must be 5-20 characters long and cannot contain numbers.`;
  }
  if (password.length < 8 || !helpers.checkPassword(password)) {
    throw `${password} is not a valid password. It must have at least one uppercase character, one number, and one special character.`;
  }

  userName = userName.toLowerCase();

  const userCollection = await users();
  const existingUser = await userCollection.findOne({ userName });
  if (existingUser) {
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (isMatch) {
      return {
        _id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        userName: existingUser.userName,
        birthday: existingUser.birthday,
        profilePic: existingUser.profilePic,
        watchlist: existingUser.watchlist,
        watchedlist: existingUser.watchedlist,
        userReviews: existingUser.userReviews,
        userComments: existingUser.userComments,
        creationDate: existingUser.creationDate
      };
    }
  }
  throw "Either the username or password is invalid";
};
