// user methods to getting user info and updating user info in db
import helpers from "../helpers.js";
import { format } from "date-fns";
import { users } from "../config/mongoCollections.js";
import bcrypt from 'bcryptjs';
import { ObjectId } from "mongodb";

const userMethods = {
    async createUser (
        email,
        password,
        fullName,
        userName,
        birthday,
        profilePic
    ) {
        email = helpers.isVaidString(email, "Email");
        fullName = helpers.isVaidString(fullName, "Full name");
        userName = helpers.isVaidString(userName, "User name");
        birthday = helpers.isValidDate(birthday);
        password = this.hashPassword(password);

        // profilePic -> limit profile pic by certain pixel size 
        const newUserObj = {
            email,
            password,
            fullName,
            userName,
            birthday,
            profilePic,
            watchList: [],
            watchedList: [],
            creationDate: format(new Date(), 'MM/dd/yyyy'),
            userReviews: [],
            userComments: []
        }

        const userCollection = await users();
        const existingEmail = await userCollection.findOne({ email });
        if (existingEmail) {
            throw new Error("Account with this email already exists");
        }
        const existingUsername = await userCollection.findOne({ userName });
        if (existingUsername) {
            throw new Error("Account with this username already exists");
        }
        const insertUser = await userCollection.insertOne(newUserObj);
        if (!insertUser.acknowledged || !insertUser.insertedId) throw new Error ("User cannot be added to the server"); // change so that error is thrown to error page;
        return 0; // does it need to return anything?
    },
    async getUserById(id) {
        id = helpers.isValidId(id);
        const userCollection = await users();
        const user = await userCollection.findOne({_id: new ObjectId(id)});
        if (user === null) throw new Error(`No user with the ID: ${id}`);
        user._id = user._id.toString();
        return user;
    },
    async updateUserInfo(id, updateObject) {
        id = helpers.isValidId(id);
        const userCollection = await users();
        const user = this.getUserById(id); // need to put logic in if user is not found for whatever reason
        if (updateObject.profilePic) {
            updateObject.profilePic = helpers.isVaidString(updateObject.profilePic, "profilePic");
            // check if valid pic   
        }
        if (updateObject.fullName) {
            updateObject.fullName = helpers.isVaidString(updateObject.fullName, "fullName");
        }
        if (updateObject.password) {
            updateObject.password = helpers.isVaidString(updateObject.password, "password");
        }
        const updatedUser = await userCollection.updateOne(
            { _id: user._id },
            { $set: updateObject },
            { returnDocument: 'after'}
        );
        if (updatedUser.modifiedCount === 0) {
            throw new Error("Failed to update user information");
        }
        return await userCollection.findOne({ _id: user._id }); // dont know if needed return statement 
    },
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // need method to check if user logged in or not, so that if user is on own page, they can edit if logged in.
}

export default userMethods; // remove, this is client side 