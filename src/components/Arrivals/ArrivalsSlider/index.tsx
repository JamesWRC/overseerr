import { uniqBy } from 'lodash';
import Link from 'next/link';
import React from 'react';
import useSWRInfinite from 'swr/infinite';
import { MediaStatus } from '../../../../server/constants/media';
import { MovieDetails } from '../../../../server/models/Movie';
import { TvDetails } from '../../../../server/models/Tv';
import useSettings from '../../../hooks/useSettings';
import { useUser } from '../../../hooks/useUser';
import Slider from '../../Slider';
import TitleCard from '../../TitleCard';

type CalendarMedia = Array<TvDetails | MovieDetails>;
interface MediaSliderProps {
    title: string;
    tvShowUrl?: string;
    movieUrl?: string;
    linkUrl?: string;
    sliderKey: string;
    hideWhenEmpty?: boolean;
    timeStart: string;
    timeEnd: string;
}

// Sorts shows by their next episode release date and movies release dates.
function sortByDatesDates(itemA: TvDetails | MovieDetails, itemB: TvDetails | MovieDetails) {
    let itemAShow, itemAMovie, itemATime;
    let itemBShow, itemBMovie, itemBTime;

    // Check what type itemA is and get its respective release date
    if ('firstAirDate' in itemA) {
        itemAShow = itemA as TvDetails
        itemATime = new Date(itemAShow.nextEpisodeToAir?.airDate || '').getTime()
    } else {
        itemAMovie = itemA as MovieDetails
        itemATime = new Date(itemAMovie.releaseDate || '').getTime()
    }

    // Check what type itemA is and get its respective release date
    if ('firstAirDate' in itemB) {
        itemBShow = itemB as TvDetails
        itemBTime = new Date(itemBShow.nextEpisodeToAir?.airDate || '').getTime()
    } else {
        itemBMovie = itemB as MovieDetails
        itemBTime = new Date(itemBMovie.releaseDate || '').getTime()
    }

    // Compare times
    if (itemATime < itemBTime) {
        return -1;
    }
    if (itemATime > itemBTime) {
        return 1;
    }
    return 0;
}

const ArrivalsSlider: React.FC<MediaSliderProps> = ({
    title,
    tvShowUrl,
    movieUrl,
    linkUrl,
    sliderKey,
    hideWhenEmpty = true,
    timeStart,
    timeEnd,
}) => {

    const calendarItems: CalendarMedia = [];
    let waitingForData = true;

    const { user } = useUser();
    const settings = useSettings();

    let refreshMilliseconds = 0

    if (title === "Today") {
        // 10 seconds
        refreshMilliseconds = 10 * 1000
    }

    // get Tv Calendar data
    const showData = useSWRInfinite<TvDetails[]>(
        () => {

            // Get time params and encode for the API all
            const startTime = encodeURIComponent(timeStart);
            const endTime = encodeURIComponent(timeEnd);

            return `${tvShowUrl}?startTime=${startTime}&endTime=${endTime}`;
        },
        {
            initialSize: 1,
            revalidateOnMount: true,
            refreshInterval: refreshMilliseconds,


        }
    );

    if (showData.data) {
        waitingForData = false
    }

    // Append the movie data to the array.
    // Note: Due to the typing, the data is encased in an array, hence the .at(0)
    calendarItems.push(...showData.data?.at(0) || [])



    // Get Movie Calendar data
    const movieData = useSWRInfinite<MovieDetails[]>(
        () => {

            // Get time params and encode for the API all
            const startTime = encodeURIComponent(timeStart);
            const endTime = encodeURIComponent(timeEnd);

            return `${movieUrl}?startTime=${startTime}&endTime=${endTime}`;
        },
        {
            initialSize: 1,
            revalidateOnMount: true

        }
    );

    if (movieData.data) {
        waitingForData = false
    }

    // Append the tv show data to the array.
    // Note: Due to the typing, the data is encased in an array, hence the .at(0)
    calendarItems.push(...movieData.data?.at(0) || [])



    if (waitingForData) {
        return <Slider
            sliderKey={sliderKey}
            isLoading={true}
            isEmpty={true}
            items={[]}
            emptyMessage={'Searching...'}
        />
    }

    // Hide if there is nothing scheduled during the time frame.
    if (hideWhenEmpty && (calendarItems ?? []).length === 0) {
        return null;
    }




    // Iterate over the movies and TV shows scheduled, sort them by release dates, then construct the title cards.
    const CalendarMedia = calendarItems.sort(sortByDatesDates).map((currTitle: TvDetails | MovieDetails) => {

        let currTitleType;
        let tvShow;
        let movie;

        // Set the types if the firstAirDate property exists
        if ('firstAirDate' in currTitle) {
            currTitleType = 'tv'
            tvShow = currTitle as TvDetails
        } else {
            currTitleType = 'movie'
            movie = currTitle as MovieDetails

        }

        // Get a random number to make each result unique incase there is duplicates for a big time frame
        const randomKeyID = Math.floor(Math.random() * 999)

        switch (currTitleType) {
            case 'movie':
                // Get the users region from settings
                const region = user?.settings?.region
                    ? user.settings.region
                    : settings.currentSettings.region
                        ? settings.currentSettings.region
                        : 'US';

                // Get the releases for the movie
                const releases = movie?.releases.results.find(
                    (r) => r.iso_3166_1 === region
                )?.release_dates;

                // Release date types:
                // 1. Premiere
                // 2. Theatrical (limited)
                // 3. Theatrical
                // 4. Digital               // Probs wanna use this one
                // 5. Physical
                // 6. TV

                const filteredReleases = uniqBy(
                    releases?.filter((r) => r.type >= 3 && r.type <= 5),
                    'type'
                );

                // Find the releases, prefer 4 over other types
                let release = filteredReleases.find(rel => rel.type === 4)
                if (!release) {
                    release = filteredReleases.find(rel => rel.type === 3)
                    if (!release) {
                        release = filteredReleases[0]
                    }
                }
                return (
                    <TitleCard
                        key={`arrival-movie-${movie?.id}-${randomKeyID}`}
                        id={movie?.id || 0}
                        image={movie?.posterPath}
                        status={movie?.mediaInfo?.status}
                        summary={movie?.overview}
                        title={movie?.title || 'Error'}
                        userScore={movie?.voteAverage || 0}
                        year={release?.release_date || ""}
                        mediaType={currTitleType}
                        inProgress={
                            (movie?.mediaInfo?.downloadStatus ?? []).length > 0
                        }

                    />
                );
            case 'tv':
                // Construct a basic description of the new episode
                let summary = `Season ${tvShow?.nextEpisodeToAir?.seasonNumber} - Episode ${tvShow?.nextEpisodeToAir?.episodeNumber}: `;
                if (tvShow?.nextEpisodeToAir?.overview?.length || 0 > 0) {
                    summary += `${tvShow?.nextEpisodeToAir?.overview} `;
                }
                // Construct an individual status for the episode, since Overseerr's status is for the whole show
                // not the episode.
                let mediaStatus = MediaStatus.PENDING;
                const isDownloading = (tvShow?.mediaInfo?.downloadStatus ?? [])?.length > 0

                if (tvShow?.mediaInfo?.status) {
                    mediaStatus = tvShow?.mediaInfo?.status
                } else {
                    mediaStatus = MediaStatus.PENDING
                }


                return (
                    <TitleCard
                        key={`arrival-tv-${tvShow?.id}-${randomKeyID}`}
                        id={tvShow?.id || 0}
                        image={tvShow?.posterPath}
                        status={mediaStatus}
                        summary={summary}
                        title={tvShow?.name || 'Error'}
                        userScore={tvShow?.voteAverage || 0}
                        year={tvShow?.firstAirDate || ''}
                        mediaType={tvShow?.mediaInfo?.mediaType || 'tv'}
                        inProgress={isDownloading}
                    />
                );
            default:
                // Return a blank element
                return (
                    <></>
                );
        }
    });

    return (
        <>
            <div className="slider-header">
                {linkUrl ? (
                    <Link href={linkUrl}>
                        <a className="slider-title">
                            <span>{title}</span>
                        </a>
                    </Link>
                ) : (
                    <div className="slider-title">
                        <span>{title}</span>
                    </div>
                )}
            </div>
            <Slider
                sliderKey={sliderKey}
                isLoading={CalendarMedia.length < 1}
                isEmpty={CalendarMedia.length === 0}
                items={CalendarMedia}
                emptyMessage={'Nothing Scheduled.'}
            />
        </>
    );
};

export default ArrivalsSlider;
