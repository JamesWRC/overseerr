import type { OverseerrPlus } from '@server/lib/settings';
import type React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
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
  laterThisMonth: 'Later this month',
  nextMonth: 'Next month',
});

const Arrivals: React.FC = () => {
  // Get overseerrPlus settings
  const overseerrPlusSettings = useSWR<OverseerrPlus>(() => {
    return '/api/v1/overseerrPlus/settings';
  });
  const intl = useIntl();

  // Used fo constructing the weekly scheduled view

  enum ScheduleTitles {
    // Day of week must start at here, sunday to saturday
    sunday = 'sunday',
    monday = 'monday',
    tuesday = 'tuesday',
    wednesday = 'wednesday',
    thursday = 'thursday',
    friday = 'friday',
    Saturday = 'saturday',
    // Can put whatever below this line but NOT above it.
    today = 'today',
    tomorrow = 'tomorrow',
    nextWeek = 'nextWeek',
  }

  const weekDayElements = [];
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date(
    new Date().toLocaleString('en-US', { timeZone: timeZone })
  );

  const weekDayNumber = today.getDay();

  for (let i = 0; i < 7; i++) {
    let dayCounter = i + weekDayNumber;

    // Once a weeks worth of days (sun-sat), loop back over again to show a full weeks worth
    if (dayCounter >= 7) {
      dayCounter -= 7;
    }

    let startDate = today;
    let endDate = today;

    const newDate = new Date(
      new Date(
        new Date().toLocaleString('en-US', { timeZone: timeZone })
      ).setHours(0, 0, 0, 0)
    );

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
      dayName = ScheduleTitles.today;

      // change title for tomorrow
    } else if (weekDayElements.length === 1) {
      dayName = ScheduleTitles.tomorrow;
    }

    const weekDaySlider = (
      <ArrivalsSlider
        sliderKey={dayName[0].toUpperCase() + dayName.substring(1)}
        title={intl.formatMessage(messages[dayName])}
        tvShowUrl="/api/v1/tv/calendar"
        movieUrl="/api/v1/movie/calendar"
        timeStart={startDate.toISOString()}
        timeEnd={endDate.toISOString()}
        hideWhenEmpty={true}
      />
    );

    weekDayElements.push(weekDaySlider);
  }

  const nextWeekBase = new Date(new Date().setHours(0, 0, 0, 0));
  const nextWeekStartDate = new Date(
    nextWeekBase.getTime() + 7 * 24 * 60 * 60 * 1000
  );
  const nextWeekEndDate = new Date(
    nextWeekBase.getTime() + 14 * 24 * 60 * 60 * 1000
  );

  const nextWeek = (
    <ArrivalsSlider
      sliderKey={'nextWeek'}
      title={intl.formatMessage(messages.nextWeek)}
      tvShowUrl="/api/v1/tv/calendar"
      movieUrl="/api/v1/movie/calendar"
      timeStart={nextWeekStartDate.toISOString()}
      timeEnd={nextWeekEndDate.toISOString()}
      hideWhenEmpty={true}
    />
  );

  const startMonth = today.getMonth();
  const endMonth = new Date(
    new Date(nextWeekEndDate.getTime() + 1 * 24 * 60 * 60 * 1000)
  ).getMonth();

  let monthContent;
  if (startMonth === endMonth) {
    // Get later this month content
    // Get end of 'next week' date + 1 day so there is no overlap of content.
    const thisMonthEndDate = new Date(
      nextWeekEndDate.getFullYear(),
      nextWeekEndDate.getMonth() + 1,
      0
    );

    // const thisMonthStartDate = nextWeekEndDate;
    const thisMonthStartDate = new Date(
      new Date(nextWeekEndDate.getTime() + 1 * 24 * 60 * 60 * 1000)
    );

    monthContent = (
      <ArrivalsSlider
        sliderKey={'Later this month'}
        title={intl.formatMessage(messages.laterThisMonth)}
        tvShowUrl="/api/v1/tv/calendar"
        movieUrl="/api/v1/movie/calendar"
        timeStart={thisMonthStartDate.toISOString()}
        timeEnd={thisMonthEndDate.toISOString()}
        hideWhenEmpty={true}
      />
    );
  } else {
    const nextMonthStartDate = new Date(
      new Date(nextWeekEndDate.getTime() + 1 * 24 * 60 * 60 * 1000)
    );
    const nextMonthEndDate = new Date(
      nextWeekEndDate.getFullYear(),
      nextWeekEndDate.getMonth() + 1,
      0
    );

    monthContent = (
      <ArrivalsSlider
        sliderKey={'Next month'}
        title={intl.formatMessage(messages.nextMonth)}
        tvShowUrl="/api/v1/tv/calendar"
        movieUrl="/api/v1/movie/calendar"
        timeStart={nextMonthStartDate.toISOString()}
        timeEnd={nextMonthEndDate.toISOString()}
        hideWhenEmpty={true}
      />
    );
  }

  return (
    <>
      {weekDayElements}
      {nextWeek}
      {overseerrPlusSettings.data?.showMonthArrival ? monthContent : null}
    </>
  );
};

export default Arrivals;
