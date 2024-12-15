import express from 'express';
import draftMethods from '../data/drafts.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Save a New Draft
router.post('/', async (req, res) => {
    const { userId, mediaId, mediaType, text } = req.body;

    if (!userId || !mediaId || !mediaType || !text) {
        return res.status(400).json({ error: 'User ID, Media ID, Media Type, and Text are required.' });
    }

    try {
        const draft = await draftMethods.saveDraft(userId, mediaId, mediaType, text);
        res.status(201).json({ message: 'Draft saved successfully.', draft });
    } catch (e) {
        console.error('Error saving draft:', e);
        res.status(500).json({ error: 'Failed to save draft.' });
    }
});

// Fetch all drafts for a user with pagination
router.get('/', async (req, res) => {
    const { userId, page = 1, limit = 10 } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required to fetch drafts.' });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
        return res.status(400).json({ error: 'Page and limit must be positive integers.' });
    }

    try {
        const skip = (pageNum - 1) * limitNum;
        const drafts = await draftMethods.getDraftsByUser(userId, skip, limitNum);
        const totalDrafts = await draftMethods.getDraftCountByUser(userId);
        const totalPages = Math.ceil(totalDrafts / limitNum);

        res.status(200).json({
            drafts,
            metadata: {
                currentPage: pageNum,
                totalPages,
                totalDrafts,
                limit: limitNum,
            },
        });
    } catch (e) {
        console.error('Error fetching drafts:', e);
        res.status(500).json({ error: 'Failed to fetch drafts.' });
    }
});

// Update a Draft
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid draft ID.' });
    }

    if (!text) {
        return res.status(400).json({ error: 'Text is required to update the draft.' });
    }

    try {
        const updatedDraft = await draftMethods.updateDraft(id, text);
        res.status(200).json({ message: 'Draft updated successfully.', draft: updatedDraft });
    } catch (e) {
        console.error('Error updating draft:', e);
        res.status(500).json({ error: 'Failed to update draft.' });
    }
});

// Publish a Draft
router.put('/:id/publish', async (req, res) => {
    const { id } = req.params;
    const { rating, text } = req.body;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid draft ID.' });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    try {
        const publishedReview = await draftMethods.publishDraft(id, rating, text);
        res.status(200).json({ message: 'Draft published successfully.', review: publishedReview });
    } catch (e) {
        console.error('Error publishing draft:', e);
        res.status(500).json({ error: 'Failed to publish draft.' });
    }
});

// Delete a Draft
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid draft ID.' });
    }

    try {
        const deleted = await draftMethods.deleteDraft(id);
        if (deleted) {
            res.status(200).json({ message: 'Draft deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Draft not found.' });
        }
    } catch (e) {
        console.error('Error deleting draft:', e);
        res.status(500).json({ error: 'Failed to delete draft.' });
    }
});

// Render drafts page with pagination
router.get('/my-drafts', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).render('error', { error: 'Unauthorized: Please log in.' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
        return res.status(400).render('error', { error: 'Page and limit must be positive integers.' });
    }

    try {
        const userId = req.session.user._id;
        const skip = (pageNum - 1) * limitNum;
        const drafts = await draftMethods.getDraftsByUser(userId, skip, limitNum);
        const totalDrafts = await draftMethods.getDraftCountByUser(userId);
        const totalPages = Math.ceil(totalDrafts / limitNum);

        res.render('drafts', {
            drafts,
            metadata: {
                currentPage: pageNum,
                totalPages,
                totalDrafts,
                limit: limitNum,
            },
        });
    } catch (e) {
        console.error('Error loading drafts:', e);
        res.status(500).render('error', { error: 'Failed to load drafts.' });
    }
});

export default router;

