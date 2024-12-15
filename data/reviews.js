import { reviews, users, movies, shows } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from './validation.js';

const getReviewsCollection = async () => {
    return await reviews();
};

const reviewMethods = {
  async createReview(userId, mediaId, mediaType, text, rating = null, draft = false) {
    userId = validation.checkId(userId);
    mediaId = validation.checkId(mediaId);
    text = validation.checkString(text, 'Review text');

    if (!draft && (!!rating || isNaN(rating) || rating < 1 || rating > 5)) {
      throw 'Rating must be a number between 1 and 5';
    }
    
    const reviewCollection = await reviews();
    const userCollection = await users();

    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'User not found';

    let mediaTitle;
    if (mediaType === 'movie') {
      const movieCollection = await movies();
      const movie = await movieCollection.findOne({ _id: new ObjectId(mediaId) });
      if (!movie) throw 'Movie not found';
      mediaTitle = movie.title;
    } else if (mediaType === 'show') {
      const showCollection = await shows();
      const show = await showCollection.findOne({ _id: new ObjectId(mediaId) });
      if (!show) throw 'Show not found';
      mediaTitle = show.name || show.title;
    } else {
      throw 'Invalid media type';
    }

    const newReview = {
      userId: new ObjectId(userId),
      username: user.username,
      mediaId: new ObjectId(mediaId),
      mediaType,
      mediaTitle,
      text,
      rating: draft ? null : parseInt(rating, 10),
      draft, //true for drafts, false for published reviews
      createdAt: new Date()
    };

    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.insertedId) throw 'Could not add review';

    return this.getReviewById(insertInfo.insertedId.toString());
  },

  async getReviewById(reviewId) {
    reviewId = validation.checkId(reviewId);
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({ _id: new ObjectId(reviewId) });
    if (!review) throw 'Review not found';
    return review;
  },

  async getAllReviewsByUser(userId) {
    userId = validation.checkId(userId);
    const reviewCollection = await reviews();
    return await reviewCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async getAllReviewsByMedia(mediaId, mediaType) {
    mediaId = validation.checkId(mediaId);
    if (!['movie', 'show'].includes(mediaType)) throw 'Invalid media type';
    
    const reviewCollection = await reviews();
    return await reviewCollection
      .find({ 
        mediaId: new ObjectId(mediaId),
        mediaType 
      })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async updateReview(reviewId, userId, text, rating) {
    reviewId = validation.checkId(reviewId);
    userId = validation.checkId(userId);
    text = validation.checkString(text, 'Review text');
    
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      throw 'Rating must be a number between 1 and 5';
    }

    const reviewCollection = await reviews();

    const existingReview = await reviewCollection.findOne({
      _id: new ObjectId(reviewId),
      userId: new ObjectId(userId)
    });

    if (!existingReview) throw 'Review not found or unauthorized';

    const updateInfo = await reviewCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          text,
          rating,
          updatedAt: new Date()
        }
      }
    );

    if (!updateInfo.modifiedCount) throw 'Could not update review';
    return await this.getReviewById(reviewId);
  },

  async removeReview(reviewId, userId) {
    reviewId = validation.checkId(reviewId);
    userId = validation.checkId(userId);

    const reviewCollection = await reviews();

    const existingReview = await reviewCollection.findOne({
      _id: new ObjectId(reviewId),
      userId: new ObjectId(userId)
    });

    if (!existingReview) throw 'Review not found or unauthorized';

    const deleteInfo = await reviewCollection.deleteOne({
      _id: new ObjectId(reviewId)
    });

    if (!deleteInfo.deletedCount) throw 'Could not delete review';
    return true;
  }
  };

export default reviewMethods;

