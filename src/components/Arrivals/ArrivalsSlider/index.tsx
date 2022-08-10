import Link from 'next/link';
import React from 'react';
import useSWRInfinite from 'swr/infinite';
import { CalendarItem } from '../../../../server/api/servarr/sonarr';
import { MediaStatus } from '../../../../server/constants/media';
import Media from '../../../../server/entity/Media';
import Slider from '../../Slider';
import TitleCard from '../../TitleCard';

interface MediaSliderProps {
    title: string;
    url: string;
    linkUrl?: string;
    sliderKey: string;
    hideWhenEmpty?: boolean;
    timeStart: string;
    timeEnd: string;
}

const ArrivalsSlider: React.FC<MediaSliderProps> = ({
    title,
    url,
    linkUrl,
    sliderKey,
    hideWhenEmpty = true,
    timeStart,
    timeEnd,
}) => {
    const { data } = useSWRInfinite(
        () => {
            // const startTime = encodeURIComponent("2022-07-23T14:00:00.000Z")
            const startTime = encodeURIComponent(timeStart);
            const endTime = encodeURIComponent(timeEnd);

            return `${url}?startTime=${startTime}&endTime=${endTime}`;
        },
        {
            initialSize: 1,
        }
    );

    if (!data) {
        return null;
    }

    const shows = [];
    const episodes: Array<CalendarItem> = [];
    const episodeMedia: Array<Media> = [];
    for (const showData of data) {
        // Iterate over shows and scheduled episodes.
        for (const show of showData.shows) {
            shows.push(show);
        }

        for (const episode of showData.episodes) {
            episodes.push(episode);
        }

        for (const media of showData.episodes) {
            episodeMedia.push(media);
        }
    }

    if (hideWhenEmpty && (shows ?? []).length === 0) {
        return null;
    }

    if (episodes.length != shows.length && episodeMedia.length != shows.length) {
        return null;
    }

    const finalTitles = shows.map((currTitle, index) => {
        const SHOW_EP_INFO = true

        // get respective data
        const episode = episodes.at(index);
        const media = episodeMedia.at(index);

        let summary = '';

        if (SHOW_EP_INFO) {
            summary = `Season ${episode?.seasonNumber} - Episode ${episode?.episodeNumber} : '${episode?.title}'`;
            summary += ` ${episode?.overview})`;
        } else {
            summary = currTitle.overview;
        }

        return (
            <TitleCard
                key={`arrival-${currTitle.id}`}
                id={currTitle.id}
                image={currTitle.poster_path}
                status={episode?.hasFile ? MediaStatus.AVAILABLE : MediaStatus.PENDING}
                summary={summary}
                title={currTitle.name}
                userScore={currTitle.vote_average}
                year={currTitle.first_air_date}
                mediaType={'tv'}
                inProgress={(media?.downloadStatus ?? []).length > 0}
            />
        );
    });

    // if (linkUrl && titles.length > 20) {
    //     finalTitles.push(
    //         <ShowMoreCard
    //             url={linkUrl}
    //             posters={titles
    //                 .slice(20, 24)
    //                 .map((title) =>
    //                     title.mediaType !== 'person' ? title.posterPath : undefined
    //                 )}
    //         />
    //     );
    // }
    return (
        <>
            <div className="slider-header">
                {linkUrl ? (
                    <Link href={linkUrl}>
                        <a className="slider-title">
                            <span>{title}</span>
                            {/* <ArrowCircleRightIcon /> */}
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
                isLoading={shows.length < 0}
                isEmpty={shows.length > 0}
                items={finalTitles}
            />
        </>
    );
};

export default ArrivalsSlider;
