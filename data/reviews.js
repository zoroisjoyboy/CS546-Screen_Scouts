import { dbConnection } from './mongoConnection.js'
import { ObjectId } from 'mongodb';

const getCollectionFn = (collectionName) => {
    let _col = undefined;

    return async () => {
        if (!_col) {
            const db = await dbConnection();
            _col = await db.collection(collectionName);
        }
        return _col;
    };
};

const reviewsCollection = getCollectionFn('reviews');

//CRUD Operations

//Add a new review (or draft)
export const createReview = async (userId, mediaId, text, rating = null, draft = true) => {
    const reviews = await reviewsCollection();

    const newReview = {
        userId, mediaId, text, date: new Date(), rating, likes: [], dislikes: [], comments: [], draft 
    };

    const insertResult = await reviews.insertOne(newReview);
    if (!insertResult.acknowledged) throw new Error('Could not create the review.');

    return insertResult.insertedId.toString();
};

//Get all drafts by a user
export const getDraftsByUser = async (userId) => {
    const reviews = await reviewsCollection();
    return reviews.find({ userId, draft: true }).toArray();
};

//Publish a draft
export const publishDraft = async (reviewId, rating) => {
    const reviews = await reviewsCollection();

    if (!rating) throw new Error('Ratings are required to publish a draft.');

    const updateResult = await reviews.updateOne(
        { _id: new ObjectId(reviewId), draft: true },
        { $set: { draft: false, rating, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) throw new Error('Could not publish the draft.');

    return true;
};