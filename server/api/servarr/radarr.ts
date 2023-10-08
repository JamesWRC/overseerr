import logger from '@server/logger';
import ServarrBase from './base';

// Overseerr PLus API - import interfaces start
import type {
  MovieCalendarItem,
  MovieFile,
} from '@server/api/servarr/overseerrPlus/interfaces/radarr';
// Overseerr PLus API - import interfaces end

export interface RadarrMovieOptions {
  title: string;
  qualityProfileId: number;
  minimumAvailability: string;
  tags: number[];
  profileId: number;
  year: number;
  rootFolderPath: string;
  tmdbId: number;
  monitored?: boolean;
  searchNow?: boolean;
}

export interface RadarrMovie {
  id: number;
  title: string;
  isAvailable: boolean;
  monitored: boolean;
  tmdbId: number;
  imdbId: string;
  titleSlug: string;
  folderName: string;
  path: string;
  profileId: number;
  qualityProfileId: number;
  added: string;
  hasFile: boolean;
  movieFile?: MovieFile;
}

class RadarrAPI extends ServarrBase<{ movieId: number }> {
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super({ url, apiKey, cacheName: 'radarr', apiName: 'Radarr' });
  }

  // Overseerr PLus API - gets all calendar items from Radarr
  public async getCalendarItems(
    startTime: string,
    endTime: string
  ): Promise<MovieCalendarItem[]> {
    let calendarItems: MovieCalendarItem[] = [];
    try {
      // Will get all items in the calendar from Radarr API
      const calendarItemsRequest = await this.axios.get<MovieCalendarItem[]>(
        '/calendar',
        {
          params: {
            unmonitored: false,
            start: startTime,
            end: endTime,
          },
        }
      );

      // Return all calendar items from Radarr
      calendarItems = calendarItemsRequest.data;
    } catch (e) {
      logger.error(`[Radarr] Failed to retrieve calendar data: ${e.message}`);
    }
    return calendarItems;
  }

  // Overseerr PLus API - deletes the movie from Radarr
  public async deleteMovie(movieId: number): Promise<void> {
    try {
      // Delete the movie via fetch
      const response = await this.axios.delete(`/movieFile/${movieId}`, {
        params: {
          deleteFiles: true,
        },
      });
      return response.data;
    } catch (e) {
      logger.error(`[Radarr] Failed to delete movie: ${e.message}`);
    }
  }

  // Overseerr API - wrapper to get movie with file from getMovieByTmdbId
  public async getMovieByTmdbIdWithMovieFile(id: number): Promise<RadarrMovie> {
    const movie: RadarrMovie = await this.getMovieByTmdbId(id);
    return movie;
  }

  // Overseerr Plus API - get the history of a movie
  public async getHistory(movieId: number): Promise<any> {
    try {
      // Get the history of the movie via fetch
      const response = await this.axios.get<any>(`/history/movie`, {
        params: {
          movieId: movieId,
          eventType: 'downloadFolderImported',
        },
      });

      return response.data;
    } catch (e) {
      logger.error(
        `[overseerr+ API - Radarr] Failed to retrieve history: ${e.message}`
      );
    }
  }

  // Overseerr Plus API - Tell radarr to mark the file as failed. This will stop radarr from trying to import the file again.
  public async markFileAsFailed(movieId: number): Promise<void> {
    try {
      // Get the latest history of the movie via fetch
      const history = await this.getHistory(movieId);
      logger.debug('Radarr history', {
        label: 'Radarr API',
        history,
      });
      logger.debug(JSON.stringify(history));

      const fileId = history[0].id;
      logger.debug('Radarr fileId', {
        label: 'Radarr API- fileId',
        fileId,
      });
      await this.axios.post(`/history/failed/${fileId}`, {});
    } catch (e) {
      logger.error(`[Radarr] Failed to mark file as failed: ${e.message}`);
    }
  }

  public getMovies = async (): Promise<RadarrMovie[]> => {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie');

      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve movies: ${e.message}`);
    }
  };

  public getMovie = async ({ id }: { id: number }): Promise<RadarrMovie> => {
    try {
      const response = await this.axios.get<RadarrMovie>(`/movie/${id}`);

      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve movie: ${e.message}`);
    }
  };

  public async getMovieByTmdbId(id: number): Promise<RadarrMovie> {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie/lookup', {
        params: {
          term: `tmdb:${id}`,
        },
      });

      if (!response.data[0]) {
        throw new Error('Movie not found');
      }

      return response.data[0];
    } catch (e) {
      logger.error('Error retrieving movie by TMDB ID', {
        label: 'Radarr API',
        errorMessage: e.message,
        tmdbId: id,
      });
      throw new Error('Movie not found');
    }
  }

  public addMovie = async (
    options: RadarrMovieOptions
  ): Promise<RadarrMovie> => {
    try {
      const movie = await this.getMovieByTmdbId(options.tmdbId);

      if (movie.hasFile) {
        logger.info(
          'Title already exists and is available. Skipping add and returning success',
          {
            label: 'Radarr',
            movie,
          }
        );
        return movie;
      }

      // movie exists in Radarr but is neither downloaded nor monitored
      if (movie.id && !movie.monitored) {
        const response = await this.axios.put<RadarrMovie>(`/movie`, {
          ...movie,
          title: options.title,
          qualityProfileId: options.qualityProfileId,
          profileId: options.profileId,
          titleSlug: options.tmdbId.toString(),
          minimumAvailability: options.minimumAvailability,
          tmdbId: options.tmdbId,
          year: options.year,
          tags: options.tags,
          rootFolderPath: options.rootFolderPath,
          monitored: options.monitored,
          addOptions: {
            searchForMovie: options.searchNow,
          },
        });

        if (response.data.monitored) {
          logger.info(
            'Found existing title in Radarr and set it to monitored.',
            {
              label: 'Radarr',
              movieId: response.data.id,
              movieTitle: response.data.title,
            }
          );
          logger.debug('Radarr update details', {
            label: 'Radarr',
            movie: response.data,
          });

          if (options.searchNow) {
            this.searchMovie(response.data.id);
          }

          return response.data;
        } else {
          logger.error('Failed to update existing movie in Radarr.', {
            label: 'Radarr',
            options,
          });
          throw new Error('Failed to update existing movie in Radarr');
        }
      }

      if (movie.id) {
        logger.info(
          'Movie is already monitored in Radarr. Skipping add and returning success',
          { label: 'Radarr' }
        );
        return movie;
      }

      const response = await this.axios.post<RadarrMovie>(`/movie`, {
        title: options.title,
        qualityProfileId: options.qualityProfileId,
        profileId: options.profileId,
        titleSlug: options.tmdbId.toString(),
        minimumAvailability: options.minimumAvailability,
        tmdbId: options.tmdbId,
        year: options.year,
        rootFolderPath: options.rootFolderPath,
        monitored: options.monitored,
        tags: options.tags,
        addOptions: {
          searchForMovie: options.searchNow,
        },
      });

      if (response.data.id) {
        logger.info('Radarr accepted request', { label: 'Radarr' });
        logger.debug('Radarr add details', {
          label: 'Radarr',
          movie: response.data,
        });
      } else {
        logger.error('Failed to add movie to Radarr', {
          label: 'Radarr',
          options,
        });
        throw new Error('Failed to add movie to Radarr');
      }
      return response.data;
    } catch (e) {
      logger.error(
        'Failed to add movie to Radarr. This might happen if the movie already exists, in which case you can safely ignore this error.',
        {
          label: 'Radarr',
          errorMessage: e.message,
          options,
          response: e?.response?.data,
        }
      );
      throw new Error('Failed to add movie to Radarr');
    }
  };

  public async searchMovie(movieId: number): Promise<void> {
    logger.info('Executing movie search command', {
      label: 'Radarr API',
      movieId,
    });

    try {
      await this.runCommand('MoviesSearch', { movieIds: [movieId] });
    } catch (e) {
      logger.error(
        'Something went wrong while executing Radarr movie search.',
        {
          label: 'Radarr API',
          errorMessage: e.message,
          movieId,
        }
      );
    }
  }
}

export default RadarrAPI;
