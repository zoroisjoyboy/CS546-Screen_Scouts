import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  draft: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

// POST route
router.post('/:mediaId/reviews', async (req, res) => {
  const { userId, rating, reviewText, draft } = req.body;
  const mediaId = req.params.mediaId; // Media ID 

  try {
    const newReview = new Review({
      userId,
      mediaId,
      rating,
      reviewText,
      draft: draft || false,
    });

    await newReview.save(); // Save the review
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review' });
  }
});

// GET route 
router.get('/:mediaId/reviews', async (req, res) => {
  const mediaId = req.params.mediaId; // Get mediaId 

  try {
    // Find reviews 
    const reviews = await Review.find({ mediaId }).sort({ createdAt: -1 });
    res.status(200).json(reviews); // Return the reviews 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// PUT route 
router.put('/:reviewId', async (req, res) => {
  const { rating, reviewText, draft } = req.body;
  const reviewId = req.params.reviewId;

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, reviewText, draft },
      { new: true } // Return 
    );
    res.status(200).json(updatedReview); // Send back 
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

export default router;
