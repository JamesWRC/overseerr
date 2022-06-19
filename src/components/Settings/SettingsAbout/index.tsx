import { InformationCircleIcon } from '@heroicons/react/solid';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import {
  SettingsAboutResponse,
  StatusResponse,
} from '../../../../server/interfaces/api/settingsInterfaces';
import globalMessages from '../../../i18n/globalMessages';
import Error from '../../../pages/_error';
import Alert from '../../Common/Alert';
import Badge from '../../Common/Badge';
import List from '../../Common/List';
import LoadingSpinner from '../../Common/LoadingSpinner';
import PageTitle from '../../Common/PageTitle';
import Releases from './Releases';

const messages = defineMessages({
  about: 'About',
  overseerrinformation: 'About Overseerr',
  version: 'Version',
  totalmedia: 'Total Media',
  totalrequests: 'Total Requests',
  gettingsupport: 'Getting Support',
  githubdiscussions: 'GitHub Discussions',
  timezone: 'Time Zone',
  appDataPath: 'Data Directory',
  supportoverseerr: 'Support Overseerr',
  helppaycoffee: 'Help Pay for Coffee',
  documentation: 'Documentation',
  preferredmethod: 'Preferred',
  outofdate: 'Out of Date',
  uptodate: 'Up to Date',
  betawarning:
    'This is BETA software. Features may be broken and/or unstable. Please report any issues on GitHub!',
  runningDevelop:
    'You are running the <code>develop</code> branch of Overseerr, which is only recommended for those contributing to development or assisting with bleeding-edge testing.',
});

const SettingsAbout: React.FC = () => {
  const intl = useIntl();
  const { data, error } = useSWR<SettingsAboutResponse>(
    '/api/v1/settings/about'
  );

  const { data: status } = useSWR<StatusResponse>('/api/v1/status');

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.about),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mt-6 rounded-md bg-indigo-700 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm leading-5 text-white">
              {intl.formatMessage(messages.betawarning)}
            </p>
            <p className="mt-3 text-sm leading-5 md:mt-0 md:ml-6">
              <a
                href="http://github.com/sct/overseerr"
                className="whitespace-nowrap font-medium text-indigo-100 transition duration-150 ease-in-out hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                GitHub &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
      {
        // OverseerrPlus github link banner
      }
      <div className="mt-6 rounded-md bg-indigo-700 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm leading-5 text-white">
              <b>OverseerrPlus: </b>
              <br />
              Please use this link to report OverseerrPlus features only. &nbsp;
              {intl.formatMessage(messages.betawarning)}
            </p>
            <p className="mt-3 text-sm leading-5 md:mt-0 md:ml-6">
              <a
                href="http://github.com/JamesWRC/overseerrPlus"
                className="whitespace-nowrap font-medium text-indigo-100 transition duration-150 ease-in-out hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                GitHub &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="section">
        <List title={intl.formatMessage(messages.overseerrinformation)}>
          {data.version.startsWith('develop-') && (
            <Alert
              title={intl.formatMessage(messages.runningDevelop, {
                code: function code(msg) {
                  return <code className="bg-opacity-50">{msg}</code>;
                },
              })}
            />
          )}
          <List.Item
            title={intl.formatMessage(messages.version)}
            className="flex flex-row items-center truncate"
          >
            <code className="truncate">
              {data.version.replace('develop-', '')}
            </code>
            {status?.commitTag !== 'local' &&
              (status?.updateAvailable ? (
                <a
                  href={
                    data.version.startsWith('develop-')
                      ? `https://github.com/sct/overseerr/compare/${status.commitTag}...develop`
                      : 'https://github.com/sct/overseerr/releases'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    badgeType="warning"
                    className="ml-2 !cursor-pointer transition hover:bg-yellow-400"
                  >
                    {intl.formatMessage(messages.outofdate)}
                  </Badge>
                </a>
              ) : (
                <a
                  href={
                    data.version.startsWith('develop-')
                      ? 'https://github.com/sct/overseerr/commits/develop'
                      : 'https://github.com/sct/overseerr/releases'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    badgeType="success"
                    className="ml-2 !cursor-pointer transition hover:bg-green-400"
                  >
                    {intl.formatMessage(messages.uptodate)}
                  </Badge>
                </a>
              ))}
          </List.Item>
          {
            // OverseerrPlus version info
          }
          <List.Item
            title={'OverseerrPlus ' + intl.formatMessage(messages.version)}
            className="flex flex-row items-center truncate"
          >
            <code className="truncate">
              {data.plusVersion.replace('develop-', '')}
            </code>
            {status?.plusCommitTag !== 'local' &&
              (status?.plusUpdateAvailable ? (
                <a
                  href={
                    data.version.startsWith('develop-')
                      ? `https://github.com/JamesWRC/overseerrPlus/compare/${status.plusCommitTag}...plus/develop`
                      : 'https://github.com/JamesWRC/overseerrPlus/releases'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    badgeType="warning"
                    className="ml-2 !cursor-pointer transition hover:bg-yellow-400"
                  >
                    {intl.formatMessage(messages.outofdate)}
                  </Badge>
                </a>
              ) : (
                <a
                  href={
                    data.version.startsWith('develop-')
                      ? 'https://github.com/JamesWRC/overseerrPlus/commits/plus/develop'
                      : 'https://github.com/JamesWRC/overseerrPlus/releases'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    badgeType="success"
                    className="ml-2 !cursor-pointer transition hover:bg-green-400"
                  >
                    {intl.formatMessage(messages.uptodate)}
                  </Badge>
                </a>
              ))}
          </List.Item>
          <List.Item title={intl.formatMessage(messages.totalmedia)}>
            {intl.formatNumber(data.totalMediaItems)}
          </List.Item>
          <List.Item title={intl.formatMessage(messages.totalrequests)}>
            {intl.formatNumber(data.totalRequests)}
          </List.Item>
          <List.Item title={intl.formatMessage(messages.appDataPath)}>
            <code>{data.appDataPath}</code>
          </List.Item>
          {data.tz && (
            <List.Item title={intl.formatMessage(messages.timezone)}>
              <code>{data.tz}</code>
            </List.Item>
          )}
        </List>
      </div>
      <div className="section">
        <List title={intl.formatMessage(messages.gettingsupport)}>
          <List.Item title={intl.formatMessage(messages.documentation)}>
            <a
              href="https://docs.overseerr.dev"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 transition duration-300 hover:underline"
            >
              https://docs.overseerr.dev
            </a>
          </List.Item>
          <>
            <div>
              <div className="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="block text-sm font-bold text-gray-400">
                  <span className="text-gray-200">OverseerrPlus</span>&nbsp;
                  {intl.formatMessage(messages.documentation)}
                </dt>
                <dd className="flex text-sm text-white sm:col-span-2 sm:mt-0">
                  <span className={`flex-grow ${'className'}`}>
                    <a
                      href="https://github.com/JamesWRC/overseerrPlus/wiki"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-500 transition duration-300 hover:underline"
                    >
                      https://github.com/JamesWRC/overseerrPlus/wiki
                    </a>
                  </span>
                </dd>
              </div>
            </div>
          </>
          <List.Item title={intl.formatMessage(messages.githubdiscussions)}>
            <a
              href="https://github.com/sct/overseerr/discussions"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 transition duration-300 hover:underline"
            >
              https://github.com/sct/overseerr/discussions
            </a>
          </List.Item>
          <>
            <div>
              <div className="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="block text-sm font-bold text-gray-400">
                  <span className="text-gray-200">OverseerrPlus</span>
                  &nbsp;GitHub Discussions
                </dt>
                <dd className="flex text-sm text-white sm:col-span-2 sm:mt-0">
                  <span className={`flex-grow ${'className'}`}>
                    <a
                      href="https://github.com/JamesWRC/overseerrPlus/discussions"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-500 transition duration-300 hover:underline"
                    >
                      https://github.com/JamesWRC/overseerrPlus/discussions
                    </a>
                  </span>
                </dd>
              </div>
            </div>
          </>
          <List.Item title="Discord">
            <a
              href="https://discord.gg/overseerr"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 transition duration-300 hover:underline"
            >
              https://discord.gg/overseerr
            </a>
          </List.Item>
        </List>
      </div>
      <div className="section">
        <List title={intl.formatMessage(messages.supportoverseerr)}>
          <List.Item
            title={`${intl.formatMessage(messages.helppaycoffee)} ☕️`}
          >
            <a
              href="https://github.com/sponsors/sct"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 transition duration-300 hover:underline"
            >
              https://github.com/sponsors/sct
            </a>
            <Badge className="ml-2">
              {intl.formatMessage(messages.preferredmethod)}
            </Badge>
          </List.Item>
          <List.Item title="">
            <a
              href="https://patreon.com/overseerr"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 transition duration-300 hover:underline"
            >
              https://patreon.com/overseerr
            </a>
          </List.Item>
        </List>
      </div>
      <div className="section">
        <Releases currentVersion={data.plusVersion} isOverseerrPlus={true} />
      </div>
      <div className="section">
        <Releases currentVersion={data.version} isOverseerrPlus={false} />
      </div>
    </>
  );
};

export default SettingsAbout;
