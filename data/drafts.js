import { reviews, users, movies, shows } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from './validation.js';

const draftMethods = {
    //Save a new draft
    async saveDraft (userId, mediaId, mediaType, text) {
        userId = validation.checkId(userId);
        mediaId = validation.checkId(mediaId);
        text = validation.checkString(text, 'Draft text');
        mediaType = validation.checkString(mediaType, 'Media type');

        const reviewCollection = await reviews();

        const newDraft = {
            userId: new ObjectId(userId),
            mediaId: new ObjectId(mediaId),
            mediaType,
            text,
            draft: true, 
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const insertInfo = await reviewCollection.insertOne(newDraft);
        if (!insertInfo.insertedId) throw 'Could not save draft.';

        return await this.getDraftById(insertInfo.insertedId.toString());
    },

    //Get a draft by ID
    async getDraftById(draftId) {
        return await this.getReviewOrDraftById(draftId, true);
    },

    //Get all drafts for a specific user
    async getDraftsByUser(userId) {
        userId = validation.checkId(userId);

        const reviewsCollection = await reviews();
        return await reviewsCollection
          .find({ userId: new ObjectId(userId), draft: true })
          .sort({ createdAt: -1 })
          .toArray();
    },


//Update a Draft
async updateDraft(draftId, text) {
  draftId = validation.checkId(draftId);
  text = validation.checkString(text, 'Draft text');

  const reviewsCollection = await reviews();

  const updateInfo = await reviewsCollection.updateOne(
    { _id: new ObjectId(draftId), draft: true },
    { $set: { text, updatedAt: new Date() } }
  );

  if (!updateInfo.modifiedCount) throw 'Could not update draft. It may not exis or is not a draft.';

  return await this.getReviewById(draftId);
},

//Publish a Draft
async publishDraft(draftId, rating, text) {
  draftId = validation.checkId(draftId);
  text = validation.checkString(text, 'Review text');

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    throw 'Rating must be a number between 1 and 5';
  }

  const reviewCollection = await reviews();

  const updateInfo = await reviewCollection.updateOne(
    { _id: new ObjectId(draftId), draft: true }, //Ensure it's a draft
    {
      $set: {
        draft: false,
        rating: parseInt(rating, 10),
        text,
        updatedAt: new Date()
      }
    }
  );

  if (!updateInfo.modifiedCount) 
    throw 'Could not publish draft. It may not exist or is not a draft.';

  return await this.getReviewById(draftId, false);
},

async getReviewOrDraftById(id, isDraft) {
    id = validation.checkId(id);
    const reviewsCollection = await reviews();
    const result = await reviewsCollection.findOne({ 
        _id: new ObjectId(id), 
        draft: !!isDraft 
    });
    if (!result) throw `${isDraft ? 'Draft' : 'Review'} not found.`;
    return result;
},
};

export default draftMethods;