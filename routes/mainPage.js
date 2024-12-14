import express from 'express';
import { movies, shows } from '../config/mongoCollections.js';
import axios from 'axios';

const router = express.Router();
const DEFAULT_LIMIT = 10;


// Get recently aired movies and shows
router.get('/api/recent', async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || DEFAULT_LIMIT; //Default to 10 results per page
        const skip = (page - 1) * limit;

        const moviesCol = await movies();
        const showsCol = await shows();

        const [recentMovies, totalMovies] = await Promise.all([
            moviesCol
                .find({})
                .sort({ release_date: -1 }) 
                .skip(skip)
                .limit(limit)
                .toArray(),
            moviesCol.countDocuments()
        ]);

        const [recentShows, totalShows] = await Promise.all([
            showsCol
                .find({}) 
                .sort({ release_date: -1 }) 
                .skip(skip)
                .limit(limit)
                .toArray(),
            showsCol.countDocuments(),
        ]);

        //Calculate total pages
        const totalPagesMovies = Math.ceil(totalMovies / limit);
        const totalPagesShows = Math.ceil(totalShows / limit);

        res.json({ 
            metadata: {
                movies: {
                    currentPage: page,
                    totalPages: totalPagesMovies,
                    totalItems: totalMovies,
                },
                shows: {
                    currentPage: page,
                    totalPages: totalPagesShows,
                    totalItems: totalShows,
                },
            },
            recentMovies,
            recentShows,
        });
    } catch (e) {
        console.error('Error fetching most recent media:', e);
        res.status(500).send('Error fetching most recent media');
    }
});

// Get trending movies and shows
router.get('/api/trending', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || DEFAULT_LIMIT; //Default to 10 results per page
        const skip = (page -1) * limit;

        const moviesCol = await movies();
        const showsCol = await shows();

        const [trendingMovies, totalMovies] = await Promise.all([ 
            moviesCol
                .find({})
                .sort({ popularity: -1, vote_average: -1, vote_count: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            moviesCol.countDocuments()
        ]);

        const [trendingShows, totalShows] = await Promise.all([
            showsCol
                .find({})
                .sort({ popularity: -1, vote_average: -1, vote_count: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            showsCol.countDocuments(),
        ]);

        const totalPagesMovies = Math.ceil(totalMovies / limit);
        const totalPagesShows = Math.ceil(totalShows / limit);

        res.json({
            metadata: {
                movies: { 
                    currentPage: page,
                    totalPages: totalPagesMovies,
                    totalItems: totalMovies,
                },
                shows: {
                    currentPage: page,
                    totalPages: totalPagesShows,
                    totalItems: totalShows,
                },
            },
            trendingMovies,
            trendingShows,
        });
    } catch (e) {
        console.error('Error fetching trending media:', e);
        res.status(500).send('Error fetching trending media');
    }
});

// Get staff recommendations
router.get('/api/recommendations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || DEFAULT_LIMIT; //Default to 10 results per page
        const skip = (page -1) * limit;

        const moviesCol = await movies();
        const showsCol = await shows();

        const [staffRecMovies, totalMovies] = await Promise.all([
            moviesCol
                .find({ recommendedByStaff: true })
                .skip(skip)
                .limit(limit)
                .toArray(),
            moviesCol.countDocuments({ recommendedByStaff: true })
        ]);

        const [staffRecShows, totalShows] = await Promise.all([
            showsCol
                .find({ recommendedByStaff: true })
                .skip(skip)
                .limit(limit)
                .toArray(),
            showsCol.countDocuments({ recommendedByStaff: true })
        ]);

        const totalPagesMovies = Math.ceil(totalMovies / limit);
        const totalPagesShows = Math.ceil(totalShows / limit);

        res.json({ 
            metadata: { 
                movies: {
                    currentPage: page,
                    totalPages: totalPagesMovies,
                    totalItems: totalMovies,
                },
                shows: {
                    currentPage: page,
                    totalPages: totalPagesShows,
                    totalItems: totalShows,
                },
            },
            staffRecMovies,
            staffRecShows,
        });
    } catch (e) {
        console.error('Error fetching staff recommendations:', e);
        res.status(500).send('Error fetching staff recommendations');
    }
});

//Main Page Route
router.get('/', async (req, res) => {
    try {
        //Fetch data from the API endpoints
        const [recent, trending, recommendations] = await Promise.all([
            axios.get(`${req.protocol}://${req.get('host')}/api/recent`),
            axios.get(`${req.protocol}://${req.get('host')}/api/trending`),
            axios.get(`${req.protocol}://${req.get('host')}/api/recommendations`),
        ]);

        const { recentMovies, recentShows } = recent.data;
        const { trendingMovies, trendingShows } = trending.data;
        const { staffRecMovies, staffRecShows } = recommendations.data;

        //Render the mainPage template with all the data
        res.render('mainPage', {
            title: 'Welcome to Screen Scouts',
            recentMovies,
            recentShows,
            trendingMovies,
            trendingShows,
            staffRecMovies,
            staffRecShows,
    });
    } catch (e) {
        console.error('Error rendering main page:', e);
        res.status(500).send('Error rendering main page');
    }
});

export default router;