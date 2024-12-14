import express from 'express';
import { reviews } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const router = express.Router();


//Save a New Draft
router.post('/reviews/drafts', async (req, res) => {
    const { userId, mediaId, text } = req.body;

    if (!userId || !mediaId || !text) {
        return res.status(400).send('User ID, Media ID, and Text are required to save a draft.');
    }

    try {
        const reviewsCollection = await reviews();
        const newDraft = {
            userId,
            mediaId,
            text,
            date: new Date(),
            rating: null, //Rating is not required for drafts
            likes: [],
            dislikes: [],
            comments: [],
            draft: true,
        };

        const result = await reviewsCollection.insertOne(newDraft);
        res.status(201).json({ id: result.insertedId, message: 'Draft saved successfully.' });
    } catch (e) {
        console.error('Error saving draft:', e);
        res.status(500).send('Error saving draft.');
    }
});

//Fetch all drafts for a user
router.get('/reviews/drafts', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).send('User ID is required to fetch drafts.');
    }

    try {
        const reviewsCollection = await reviews();
        const drafts = await reviewsCollection.find({ userId, draft: true }).toArray();

        res.status(200).json(drafts);
    } catch (e) {
        console.error('Error fetching drafts:', e);
        res.status(500).send('Error fetching drafts.');
    }
});

//Update a Draft
router.put('/reviews/drafts/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send(`Invalid draft ID.`);
    }

    if (!text) {
        return res.status(400).send('Text is required to update the draft.');
    }

    try {
        const reviewsCollection = await reviews();
        const result = await reviewsCollection.updateOne( 
            { _id: ObjectId(id), draft: true },
            { $set: { text, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Draft not found or no changes made.');
        }

        res.status(200).send('Draft updated successfully.');
    } catch (e) {
        console.error('Error updating draft:', e);
        res.status(500).send('Error updating draft.');
    }
});

//Publish a Review
router.post('/reviews', async (req, res) => {
    const { userId, mediaId, text, rating } = req.body;

    if (!userId || !mediaId || !text || !rating) {
        return res.status(400).send('All fields are required to publish a review.');
    }

    try {
        const reviewsCollection = await reviews();
        const newReview = { userId, mediaId, text, date:new Date(), rating: parseInt(rating, 10), likes: [], dislikes: [], comments: [], draft: false, 
        };

        const result = await reviewsCollection.insertOne(newReview);
        res.status(201).json({ id: result.insertedId, message: 'Review published succesfully.' });
    } catch (e) {
        console.error('Error publishing review:', e);
        res.status(500).send('Error publishing review.');
    }
});

//View all reviews for a movie or show
router.get('/reviews/:mediaId', async (req, res) => {
    const { mediaId } = req.params;

    if (!mediaId) {
        return res.status(400).send('Media ID is required to fetch reviews.');
    }

    try {
        const reviewsCollection = await reviews();
        const reviewsForMedia = await reviewsCollection.find({ mediaId, draft: false }).toArray();

        res.status(200).json(reviewsForMedia);
    } catch (e) {
        console.error('Error fetching reviewS:', e);
        res.status(500).send('Error fetching reviews.');
    }
});

//View a Specific Review
router.get('/reviews/:id', async(req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid review ID.');
    }

    try {
        const reviewsCollection = await reviews();
        const review = await reviewsCollection.findOne({ _id: ObjectId(id) });

        if (!review) {
            return res.status(404).send('Review now found.');
        }

        res.status(200).json(review);
    } catch (e) {
        console.error('Error fetching review:', e);
        res.status(500).send('Error fetching review.');
    }
});

//Delete a Review
router.delete('/reviews/:id', async(req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid review ID.');
    }

    try {
        const reviewsCollection = await reviews();
        const result = await reviewsCollection.deleteOne({ _id: ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send('Review not found.');
        }

        res.status(200).send('Review deleted successfully.');
    } catch (e) {
        console.error('Error deleting review:', e);
        res.status(500).send('Error deleting review.');
    }
})