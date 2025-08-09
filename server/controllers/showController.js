import axios from 'axios';
import https from 'https';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

// HTTPS agent config
const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 5000,
});

// ✅ Fetch now playing movies
export const getNowPlayingMovies = async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        Accept: 'application/json',
      },
      httpsAgent,
    });

    const movies = response.data.results;
    res.json({ success: true, movies });
  } catch (error) {
    console.error('TMDB fetch error:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch now playing movies',
      error: error.message,
    });
  }
};

// ✅ Add new show (and movie if not in DB)
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let movie = await Movie.findById(movieId);

    if (!movie) {
      console.log("Fetching movie from TMDB for ID:", movieId);

      const headers = {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        Accept: 'application/json'
      };

      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, { headers }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, { headers })
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title || "Untitled",
        overview: movieApiData.overview || "No overview available.",
        poster_path: movieApiData.poster_path || "",
        backdrop_path: movieApiData.backdrop_path || "",
        release_date: movieApiData.release_date || "",
        original_language: movieApiData.original_language || "",
        tagline: movieApiData.tagline || "",
        genres: movieApiData.genres || [],
        casts: movieCreditsData.cast || [],
        vote_average: movieApiData.vote_average || 0,
        runtime: movieApiData.runtime || 0,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];

    showsInput.forEach(show => {
      const showDate = show.date;
      show.time.forEach(time => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {}
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: 'Show Added Successfully' });

  } catch (error) {
    console.error('Add Show Error:', error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add show",
      error: error.message
    });
  }
};
