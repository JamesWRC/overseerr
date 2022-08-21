import { existsSync } from 'fs';
import path from 'path';
import logger from '../logger';

const COMMIT_TAG_PATH = path.join(__dirname, '../../committag.json');
let commitTag = 'local';
let plusCommitTag = 'local';

if (existsSync(COMMIT_TAG_PATH)) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commitTagData = require(COMMIT_TAG_PATH);
  commitTag = commitTagData.commitTag;
  plusCommitTag = commitTagData.plusCommitTag;
  logger.info(`Commit Tag: ${commitTag}`);
  logger.info(`OverseerrPlus Commit Tag: ${plusCommitTag}`);
}

export const getCommitTag = (): string => {
  return commitTag;
};

export const getPlusCommitTag = (): string => {
  return plusCommitTag;
};

export const getAppVersion = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require('../../package.json');

  let finalVersion = version;

  if (version === '0.1.0') {
    finalVersion = `develop-${getCommitTag()}`;
  }

  return finalVersion;
};

export const getPlusAppVersion = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const finalVersion = getPlusCommitTag();

  return finalVersion;
};
