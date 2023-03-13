import RottenTomatoes from '@server/api/rottentomatoes';
import TheMovieDb from '@server/api/themoviedb';
import { MediaType } from '@server/constants/media';
import Media from '@server/entity/Media';
import logger from '@server/logger';
import { mapTvResult } from '@server/models/Search';
import { mapSeasonWithEpisodes, mapTvDetails } from '@server/models/Tv';
import { Router } from 'express';

import { TmdbTvDetails } from '../../server/api/themoviedb/interfaces';
import SonarrAPI from '../api/servarr/sonarr';
import { getSettings } from '../lib/settings';
import { TvDetails } from '@server/models/Tv';
import { MediaStatus } from '@server/constants/media'

const tvRoutes = Router();


tvRoutes.get('/calendar', async (req, res, next) => {
  // Current version of the API for sonarr
  const SONARR_API_VERSION = '/api/v3'

  const tmdb = new TheMovieDb();
  const settings = getSettings();

  const sonarrSettings = settings.sonarr

  // Return error if no sonarr server has been setup
  if (!sonarrSettings || sonarrSettings.length === 0) {
    return next({
      status: 404,
      message: 'No Sonarr server has been setup.',
    });
  }

  const calItems: Array<TvDetails> = []
  try {

    // Search through all sonarr servers
    for (const sonarrInstance of sonarrSettings) {

      // Get Sonarr instance
      const sonarr = new SonarrAPI({
        apiKey: sonarrInstance.apiKey,
        url: SonarrAPI.buildUrl(sonarrInstance, SONARR_API_VERSION),
      });

      // Set query params (see /overseerr-apy.yml)
      let startTime = req.query.startTime as string;
      let endTime = req.query.endTime as string;

      // Have default values if needed
      if (!startTime) {
        startTime = new Date().toISOString();
      }
      if (!endTime) {
        endTime = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Get calendar items 
      const calData = await sonarr.getCalendarItems(startTime, endTime)

      // Get queue of downloading items to check status of
      const downloadQueue = await sonarr.getQueue()

      // Search through all scheduled items
      for (const show of calData) {

        const sonarrSeriesID = Number(show.seriesId)

        // Get the series by the id sent from sonarr
        const showData = await sonarr.getSeriesByID(sonarrSeriesID)

        // Get show details
        const tv = <TmdbTvDetails>await tmdb.getMediaByImdbId({
          imdbId: showData.imdbId,
          language: req.locale ?? (req.query.language as string),
        });



        // Get the show media (needed for download status etc)
        const media = await Media.getMedia(tv.id, MediaType.TV);

        let status = MediaStatus.PENDING
        // Check episode download status
        if (tv.next_episode_to_air?.air_date) {
          // Override the air date for the next episode to be a UTC format
          // tv.next_episode_to_air.air_date = show.airDateUtc
          if (!show.hasFile) {
            for (const item of downloadQueue) {
              if (item.seriesId === show.seriesId && item.episodeId === item.episodeId) {

                if (item.trackedDownloadState === "downloading") {
                  status = MediaStatus.PROCESSING
                }

              } else {
                status = MediaStatus.AVAILABLE
              }
            }
          } else {
            status = MediaStatus.AVAILABLE

          }
        }

        // Set media status
        if (media) {
          media.status = status
        }

        // Update tv episode number since this object may be weeks ahead of the next episode data.
        if (tv.next_episode_to_air) {
          // Update show season / episode numbers.
          tv.next_episode_to_air.season_number = show.seasonNumber
          tv.next_episode_to_air.episode_number = show.episodeNumber

          // Update show date and description.
          tv.next_episode_to_air.air_date = show.airDateUtc
          tv.next_episode_to_air.overview = show.title
        }

        // Add the mapped movie and mediaInfo to an array
        calItems.push(mapTvDetails(tv, media))
      }
    }
    // Return the mapped data.
    return res.status(200).json(calItems);

  } catch (e) {
    logger.debug('Something went wrong retrieving calendar data.', { label: 'API', errorMessage: e.message });
    return next({
      status: 500,
      message: 'Unable to retrieve calendar data.'
    });
  }
});

tvRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  const headers = req.headers;
  const TV_ID = req.params.id;

  const OTHER_DB_SERVICE_HEADER = 'x-db-service';

  // All supported DB services other than the default TMDB
  const IMDB = 'IMDB';
  const IMDB_PREFIX = 'tt';

  try {
    let tv;
    let DB_SERVICE = '';

    if (OTHER_DB_SERVICE_HEADER in headers) {
      DB_SERVICE = headers[OTHER_DB_SERVICE_HEADER] as string;
    }

    if (DB_SERVICE === IMDB) {
      tv = <TmdbTvDetails>await tmdb.getMediaByImdbId({
        imdbId: IMDB_PREFIX + TV_ID,
        language: req.locale ?? (req.query.language as string),
      });
    } else {
      tv = await tmdb.getTvShow({
        tvId: Number(TV_ID),
        language: req.locale ?? (req.query.language as string),
      });
    }

    const media = await Media.getMedia(tv.id, MediaType.TV);

    return res.status(200).json(mapTvDetails(tv, media));
  } catch (e) {
    logger.debug('Something went wrong retrieving series', {
      label: 'API',
      errorMessage: e.message,
      tvId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve series.',
    });
  }
});

tvRoutes.get('/:id/season/:seasonNumber', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const season = await tmdb.getTvSeason({
      tvId: Number(req.params.id),
      seasonNumber: Number(req.params.seasonNumber),
      language: req.locale ?? (req.query.language as string),
    });

    return res.status(200).json(mapSeasonWithEpisodes(season));
  } catch (e) {
    logger.debug('Something went wrong retrieving season', {
      label: 'API',
      errorMessage: e.message,
      tvId: req.params.id,
      seasonNumber: req.params.seasonNumber,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve season.',
    });
  }
});

tvRoutes.get('/:id/recommendations', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.getTvRecommendations({
      tvId: Number(req.params.id),
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
        mapTvResult(
          result,
          media.find(
            (req) => req.tmdbId === result.id && req.mediaType === MediaType.TV
          )
        )
      ),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving series recommendations', {
      label: 'API',
      errorMessage: e.message,
      tvId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve series recommendations.',
    });
  }
});

tvRoutes.get('/:id/similar', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.getTvSimilar({
      tvId: Number(req.params.id),
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
        mapTvResult(
          result,
          media.find(
            (req) => req.tmdbId === result.id && req.mediaType === MediaType.TV
          )
        )
      ),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving similar series', {
      label: 'API',
      errorMessage: e.message,
      tvId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve similar series.',
    });
  }
});

tvRoutes.get('/:id/ratings', async (req, res, next) => {
  const tmdb = new TheMovieDb();
  const rtapi = new RottenTomatoes();

  try {
    const tv = await tmdb.getTvShow({
      tvId: Number(req.params.id),
    });

    const rtratings = await rtapi.getTVRatings(
      tv.name,
      tv.first_air_date ? Number(tv.first_air_date.slice(0, 4)) : undefined
    );

    if (!rtratings) {
      return next({
        status: 404,
        message: 'Rotten Tomatoes ratings not found.',
      });
    }

    return res.status(200).json(rtratings);
  } catch (e) {
    logger.debug('Something went wrong retrieving series ratings', {
      label: 'API',
      errorMessage: e.message,
      tvId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve series ratings.',
    });
  }
});

export default tvRoutes;
