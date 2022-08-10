import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ArrivalsSlider from './ArrivalsSlider';

const messages = defineMessages({
  discover: 'Discover',
  recentrequests: 'Recent Requests',
  popularmovies: 'Popular Movies',
  populartv: 'Popular Series',
  upcomingtv: 'Upcoming Series',
  recentlyAdded: 'Recently Added',
  noRequests: 'No requests.',
  upcoming: 'Upcoming Movies',
  trending: 'Trending',
  today: 'Today',
  nextWeek: 'Next Week',
});

const Arrivals: React.FC = () => {

  const intl = useIntl();

  return (
    <>
      <ArrivalsSlider
        sliderKey="Today"
        title={intl.formatMessage(messages.today)}
        url="/api/v1/tv/calendar"
        linkUrl="/discover/trending"
        timeStart={new Date().toISOString()}
        timeEnd={new Date(new Date().setHours(23, 59, 59, 999)).toISOString()}
      />
      <ArrivalsSlider
        sliderKey="Next Week"
        title={intl.formatMessage(messages.nextWeek)}
        url="/api/v1/tv/calendar"
        linkUrl="/discover/trending"
        timeStart={new Date().toISOString()}
        timeEnd={new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()}
      />
    </>
  );
};

export default Arrivals;
