import RadarrAPI from '@server/api/servarr/radarr';
import SonarrAPI from '@server/api/servarr/sonarr';
import { MediaStatus, MediaType } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import type Issue from '@server/entity/Issue';
import Media from '@server/entity/Media';
import Season from '@server/entity/Season';
import type Settings from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';

export async function issueAutoRerequest(issue: Issue) {
  const settings = getSettings().load();
  // If Overseerr Plus issueAutoRerequest is not enabled, return false
  if (settings.overseerrPlus.issueAutoRerequest !== true) {
    return false;
  }

  switch (issue.media.mediaType) {
    case MediaType.MOVIE:
      logger.debug('MediaType.MOVIE');
      await reRequestMovie(settings, issue);
      break;
    case MediaType.TV:
      logger.debug('MediaType.TV');
      await reRequestTv(settings, issue);
      break;
    default:
      logger.debug('MediaType.OTHER');
  }
}

async function reRequestTv(settings: Settings, issue: Issue) {
  const sonarrInstances: SonarrAPI[] = [];
  const SONARR_API_VERSION = '/api/v3';
  const sonarrSettings = settings.sonarr;

  // Search through all radarr servers
  for (const sonarrInstance of sonarrSettings) {
    // Skip the 4k server if its the same server. IE the 4k server is the same server but with the 4k quality profile applied.
    if (
      sonarrSettings.filter(
        (e) =>
          e.hostname === sonarrInstance.hostname &&
          e.port === sonarrInstance.port &&
          sonarrInstance.is4k
      ).length > 0
    ) {
      continue;
    }

    // Get radarr instance
    const sonarr = new SonarrAPI({
      apiKey: sonarrInstance.apiKey,
      url: RadarrAPI.buildUrl(sonarrInstance, SONARR_API_VERSION),
    });
    sonarrInstances.push(sonarr);
    // sonarrInstancesSettings.push(sonarrInstance);
  }

  const seriesID: number | null | undefined = issue.media.externalServiceId;
  const mediaID: number = issue.media.id;
  let problemSeasonNumber: number = issue.problemSeason;
  const problemEpisodeNumber: number = issue.problemEpisode;
  let searchMedia = false;
  let allEpisodes = false;
  if (seriesID) {
    // Handle whole season
    // An issue has been raised for a whole season (problemEpisodeNumber is 0), so we need to re-request the whole season.
    if (problemEpisodeNumber === 0) {
      logger.debug('handle season');
      for (const issueSeason of issue.media.seasons) {
        problemSeasonNumber = issueSeason.seasonNumber; // This is the same ID as the problem season attribute in the issue
        allEpisodes = true; // We want to re-request all episodes in the season
        searchMedia = true;
        await reRequestTvEpisode(
          seriesID,
          mediaID,
          problemSeasonNumber,
          problemEpisodeNumber,
          sonarrInstances,
          searchMedia,
          allEpisodes
        );
      }
    } else {
      // Handle single episode
      await reRequestTvEpisode(
        seriesID,
        mediaID,
        problemSeasonNumber,
        problemEpisodeNumber,
        sonarrInstances,
        searchMedia,
        allEpisodes
      );
    }
  }
}

async function reRequestTvEpisode(
  seriesID: number,
  mediaID: number,
  problemSeasonNumber: number,
  problemEpisodeNumber: number,
  sonarrInstances: SonarrAPI[],
  searchMedia: boolean,
  allEpisodes: boolean
) {
  const mediaRepository = getRepository(Media);
  const seasonRepository = getRepository(Season);

  if (seriesID) {
    for (const sonarrInstance of sonarrInstances) {
      await sonarrInstance.getEpisodes(seriesID).then(async (episodes) => {
        for (const episode of episodes) {
          // If allEpisodes is true, then we want to re-request all episodes. Otherwise we only want to re-request the problem episode.
          if (
            allEpisodes ||
            (episode.seasonNumber === problemSeasonNumber &&
              episode.episodeNumber === problemEpisodeNumber)
          ) {
            // const episodeID: number = episode.id; // Used to mark file as failed
            const episodeFileID: number = episode.episodeFileId; // Used to delete file from disk
            const seriesID: number = episode.seriesId; // Overseerr series ID

            await sonarrInstance
              .markFileAsFailed(episodeFileID, seriesID, episode.seasonNumber)
              .catch((error) => {
                logger.error('error');
                logger.error(error);
              });

            logger.debug('delete episode');
            await sonarrInstance.deleteEpisode(episodeFileID).catch((error) => {
              logger.error('error');
              logger.error(error);
            });

            logger.debug(
              'set overseerr status to show episode has been re-requested'
            );

            // Set the status to processing for whole show, so the user can see that the request is being processed.
            await mediaRepository.update(mediaID, {
              status: MediaStatus.PROCESSING,
              status4k: MediaStatus.PROCESSING,
            });
          }
        }

        // Set the status to processing for specific season, so the user can see that the request is being processed.
        await seasonRepository.update(problemSeasonNumber, {
          status: allEpisodes
            ? MediaStatus.PROCESSING
            : MediaStatus.PARTIALLY_AVAILABLE,
          status4k: allEpisodes
            ? MediaStatus.PROCESSING
            : MediaStatus.PARTIALLY_AVAILABLE,
        });

        // Request Sonarr to search for missing episodes.
        if (searchMedia) {
          logger.debug('search season again');
          await sonarrInstance.searchSeries(seriesID).catch((error) => {
            logger.error('error');
            logger.error(error);
          });
        }
      });
    }
  }
}

// ##################### RE REQUEST MOVIE #####################
async function reRequestMovie(settings: Settings, issue: Issue) {
  const tmdbid: number = issue.media.tmdbId;

  const radarrInstances: RadarrAPI[] = [];
  // const radarrInstancesSettings: RadarrSettings[] = []

  // Current version of the API for sonarr
  const RADARR_API_VERSION = '/api/v3';

  const radarrSettings = settings.radarr;

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
      url: RadarrAPI.buildUrl(radarrInstance, RADARR_API_VERSION),
    });
    radarrInstances.push(radarr);
    // radarrInstancesSettings.push(radarrInstance);
  }

  logger.debug('radarrInstances');
  logger.debug(radarrInstances.length);
  for (let i = 0; i < radarrInstances.length; i++) {
    const radarrInstance: RadarrAPI = radarrInstances[i];

    await radarrInstance
      .getMovieByTmdbIdWithMovieFile(tmdbid)
      .then(async (movie) => {
        const movieFileID = movie.movieFile?.id ? movie.movieFile.id : -99;
        logger.debug('movieFileID');
        logger.debug(JSON.stringify(movie));
        // Tell radarr to mark the file as failed. This will stop radarr from trying to import the file again.
        await radarrInstance.markFileAsFailed(movie.id).catch((error) => {
          logger.error('error');
          logger.error(error);
        });

        // Tell radarr to delete the file. This will remove the file from the disk.
        await radarrInstance.deleteMovie(movieFileID).catch((error) => {
          logger.error('error');
          logger.error(error);
        });

        const mediaRepository = getRepository(Media);

        // Set the status to processing, so the user can see that the request is being processed.
        await mediaRepository.update(issue.media.id, {
          status: MediaStatus.PROCESSING,
          status4k: MediaStatus.PROCESSING,
        });
        await radarrInstance.searchMovie(movie.id).catch((error) => {
          logger.error('error');
          logger.error(error);
        });
      });
  }
}
