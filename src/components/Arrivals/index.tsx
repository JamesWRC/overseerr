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
  tomorrow: 'Tomorrow',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  nextWeek: 'Next Week',
});

const Arrivals: React.FC = () => {

  const intl = useIntl();

  // Used fo constructing the weekly scheduled view

  enum ScheduleTitles {
    // Day of week must start at here, sunday to saturday
    sunday = "sunday",
    monday = "monday",
    tuesday = "tuesday",
    wednesday = "wednesday",
    thursday = "thursday",
    friday = "friday",
    Saturday = "saturday",
    // Can put whatever below this line but NOT above it.
    today = "today",
    tomorrow = "tomorrow",
    nextWeek = "nextWeek",
  }

  const weekDayElements = []
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: timeZone }));

  const weekDayNumber = today.getDay();



  for (let i = 0; i < 7; i++) {
    let dayCounter = i + weekDayNumber

    // Once a weeks worth of days (sun-sat), loop back over again to show a full weeks worth
    if (dayCounter >= 7) {
      dayCounter -= 7
    }

    let startDate = today
    let endDate = today

    const newDate = new Date(new Date(new Date().toLocaleString('en-US', { timeZone: timeZone })).setHours(0, 0, 0, 0))

    // Get end of day
    endDate = new Date(newDate.getTime() + i * 24 * 60 * 60 * 1000);
    // Get start of day
    startDate = new Date(new Date(endDate.getTime()).setHours(0, 0, 0, 0));

    // Set day to end of day time (midnight)
    endDate = new Date(endDate.setHours(23, 59, 59, 999));

    // Get the day name based on the counter (example; monday)
    let dayName = Object.values(ScheduleTitles)[dayCounter];

    // Change title for today
    if (weekDayElements.length === 0) {
      dayName = ScheduleTitles.today

      // change title for tomorrow
    } else if (weekDayElements.length === 1) {
      dayName = ScheduleTitles.tomorrow

    }

    const weekDaySlider = <ArrivalsSlider
      sliderKey={dayName[0].toUpperCase() + dayName.substring(1)}
      title={intl.formatMessage(messages[dayName])}
      tvShowUrl="/api/v1/tv/calendar"
      movieUrl="/api/v1/movie/calendar"
      timeStart={startDate.toISOString()}
      timeEnd={endDate.toISOString()}
      hideWhenEmpty={true}
    />

    weekDayElements.push(weekDaySlider)
  }



  return (
    <>
      {weekDayElements}
    </>
  );
};

export default Arrivals;
