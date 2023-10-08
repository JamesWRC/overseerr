import type {
  Language,
  Revision,
} from '@server/api/servarr/overseerrPlus/interfaces/common';

export interface EpisodeFile {
  seriesId: number;
  seasonNumber: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: Date;
  sceneName: string;
  language: Language;
  quality: EpisodeFileQuality;
  mediaInfo: MediaInfo;
  qualityCutoffNotMet: boolean;
  languageCutoffNotMet: boolean;
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
  videoFps: number;
  videoDynamicRange: string;
  videoDynamicRangeType: string;
  resolution: string;
  runTime: string;
  scanType: string;
  subtitles: string;
}

export interface EpisodeFileQuality {
  quality: SonarrQuality;
  revision: Revision;
}

export interface SonarrQuality {
  id: number;
  name: string;
  source: string;
  resolution: number;
}

// ################### Sonarr History ###################
export interface SonarrHistory {
  episodeId: number;
  seriesId: number;
  sourceTitle: string;
  language: Language;
  quality: SonarrHistoryQuality;
  qualityCutoffNotMet: boolean;
  languageCutoffNotMet: boolean;
  date: Date;
  downloadId: string;
  eventType: string;
  data: HistoryData;
  id: number;
}

export interface HistoryData {
  fileId: string;
  droppedPath: string;
  importedPath: string;
  downloadClient: string;
  downloadClientName: string;
  preferredWordScore: string;
  releaseGroup: string;
}

export interface SonarrHistoryQuality {
  quality: SonarrQuality;
  revision: Revision;
}
