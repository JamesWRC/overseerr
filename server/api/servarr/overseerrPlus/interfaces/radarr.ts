import type {
  Language,
  Revision,
} from '@server/api/servarr/overseerrPlus/interfaces/common';
import type { RadarrMovie } from '@server/api/servarr/radarr';

export interface MovieCalendarItem extends RadarrMovie {
  poster_path: string;
  summary: string;
  vote_average: number;
  year: string;
}

export interface MovieFile {
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: Date;
  sceneName: string;
  indexerFlags: number;
  quality: MovieFileQuality;
  mediaInfo: MediaInfo;
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
  languages: Language[];
  releaseGroup: string;
  edition: string;
  id: number;
}

export interface MediaInfo {
  audioBitrate: number;
  audioChannels: number;
  audioCodec: string;
  audioLanguages: string;
  audioStreamCount: number;
  videoBitDepth: number;
  videoBitrate: number;
  videoCodec: string;
  videoDynamicRangeType: string;
  videoFps: number;
  resolution: string;
  runTime: string;
  scanType: string;
  subtitles: string;
}

export interface MovieFileQuality {
  quality: RadarrQuality;
  revision: Revision;
}

export interface RadarrQuality {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
}

export interface RadarrHistory {
  movieId: number;
  sourceTitle: string;
  languages: Language[];
  quality: RadarrHisatoryQuality;
  customFormats: string[];
  qualityCutoffNotMet: boolean;
  date: Date;
  downloadId: string;
  eventType: string;
  data: Data;
  id: number;
}

export interface Data {
  fileId: string;
  droppedPath: string;
  importedPath: string;
  downloadClient: string;
  downloadClientName: string;
  releaseGroup: string;
}

export interface RadarrHisatoryQuality {
  quality: RadarrQuality;
  revision: Revision;
}

export interface RadarrQuality {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
}
