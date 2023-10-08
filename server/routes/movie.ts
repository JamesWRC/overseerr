import RottenTomatoes from '@server/api/rottentomatoes';
import RadarrAPI from '@server/api/servarr/radarr';
import TheMovieDb from '@server/api/themoviedb';
import type { TmdbMovieDetails } from '@server/api/themoviedb/interfaces';
import { MediaType } from '@server/constants/media';
import Media from '@server/entity/Media';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import type { MovieDetails } from '@server/models/Movie';
import { mapMovieDetails } from '@server/models/Movie';
import { mapMovieResult } from '@server/models/Search';
import { Router } from 'express';

const movieRoutes = Router();

// OverseerrPlus - Calendar API - Used for Arrivals feature
movieRoutes.get('/calendar', async (req, res, next) => {
  // Current version of the API for sonarr
  const SONARR_API_VERSION = '/api/v3';

  const tmdb = new TheMovieDb();
  const settings = getSettings();

  const radarrSettings = settings.radarr;

  // Return error if no radarr server has been setup
  if (!radarrSettings || radarrSettings.length === 0) {
    return next({
      status: 404,
      message: 'No Radarr server has been setup.',
    });
  }

  const calItems: MovieDetails[] = [];
  try {
    // Search through all radarr servers
    for (const radarrInstance of radarrSettings) {
      // Skip the 4k server if its the same server. IE the 4k server is the same server but with the 4k quality profile applied.
      if (
        radarrSettings.filter(
          (e) =>
            e.hostname === radarrInstance.hostname &&
            e.port === radarrInstance.port &&
            radarrInstance.is4k
        ).length > 0
      ) {
        continue;
      }
      // Get radarr instance
      const radarr = new RadarrAPI({
        apiKey: radarrInstance.apiKey,
        url: RadarrAPI.buildUrl(radarrInstance, SONARR_API_VERSION),
      });

      // Set query params (see /overseerr-apy.yml)
      let startTime = req.query.startTime as string;
      let endTime = req.query.endTime as string;

      // Have default values if needed.
      if (!startTime) {
        startTime = encodeURIComponent(new Date().toISOString());
      }
      if (!endTime) {
        endTime = encodeURIComponent(
          new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        );
      }

      // Get all calendar items
      const calData = await radarr.getCalendarItems(startTime, endTime);

      // Search through all scheduled items
      for (const movie of calData) {
        // Get movie details
        const movieDetails = <TmdbMovieDetails>await tmdb.getMediaByImdbId({
          imdbId: movie.imdbId,
          language: req.locale ?? (req.query.language as string),
        });

        // Get the movie media (needed for download status etc)
        const media = await Media.getMedia(movieDetails.id, MediaType.MOVIE);

        // Add the mapped movie and mediaInfo to an array
        calItems.push(mapMovieDetails(movieDetails, media));
      }
    }
    // Return the mapped data.
    return res.status(200).json(calItems);
  } catch (e) {
    logger.debug('Something went wrong retrieving calendar data.', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve calendar data.',
    });
  }
});

movieRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const tmdbMovie = await tmdb.getMovie({
      movieId: Number(req.params.id),
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getMedia(tmdbMovie.id, MediaType.MOVIE);
    return res.status(200).json(mapMovieDetails(tmdbMovie, media));
  } catch (e) {
    logger.debug('Something went wrong retrieving movie', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie.',
    });
  }
});

movieRoutes.get('/:id/recommendations', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.getMovieRecommendations({
      movieId: Number(req.params.id),
      page: Number(req.query.page),
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getRelatedMedia(
      results.results.map((result) => result.id)
    );

    return res.status(200).json({
      page: results.page,
      totalPages: results.total_pages,
      totalResults: results.total_results,
      results: results.results.map((result) =>
        mapMovieResult(
          result,
          media.find(
            (req) =>
              req.tmdbId === result.id && req.mediaType === MediaType.MOVIE
          )
        )
      ),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving movie recommendations', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie recommendations.',
    });
  }
});

movieRoutes.get('/:id/similar', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.getMovieSimilar({
      movieId: Number(req.params.id),
      page: Number(req.query.page),
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getRelatedMedia(
      results.results.map((result) => result.id)
    );

    return res.status(200).json({
      page: results.page,
      totalPages: results.total_pages,
      totalResults: results.total_results,
      results: results.results.map((result) =>
        mapMovieResult(
          result,
          media.find(
            (req) =>
              req.tmdbId === result.id && req.mediaType === MediaType.MOVIE
          )
        )
      ),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving similar movies', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve similar movies.',
    });
  }
});

movieRoutes.get('/:id/ratings', async (req, res, next) => {
  const tmdb = new TheMovieDb();
  const rtapi = new RottenTomatoes();

  try {
    const movie = await tmdb.getMovie({
      movieId: Number(req.params.id),
    });

    const rtratings = await rtapi.getMovieRatings(
      movie.title,
      Number(movie.release_date.slice(0, 4))
    );

    if (!rtratings) {
      return next({
        status: 404,
        message: 'Rotten Tomatoes ratings not found.',
      });
    }

    return res.status(200).json(rtratings);
  } catch (e) {
    logger.debug('Something went wrong retrieving movie ratings', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie ratings.',
    });
  }
});

export default movieRoutes;
