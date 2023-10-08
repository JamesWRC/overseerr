// ################### Common between Sonarr and Radarr ###################
export interface Language {
  id: number;
  name: string;
}

export interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}
