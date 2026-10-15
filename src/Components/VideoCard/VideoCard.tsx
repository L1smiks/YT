import { Link } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import UserAvatar from '../UserAvatar/UserAvatar.tsx';
import Thumbnail from '../Thumbnail/Thumbnail.tsx';
import { channelLabel, formatRelativeDate, formatViews } from '../../utils/format.ts';
import { categoryTitle } from '../../config.ts';
import type { Video } from '../../types.ts';
import './VideoCard.scss';

type VideoCardProps = {
    video: Video;
    /** "grid" for the home feed, "row" for search results. */
    layout?: 'grid' | 'row';
};

function VideoCard({ video, layout = 'grid' }: VideoCardProps) {
    const href = `/video?id=${video.id}`;
    const meta = [formatViews(video.views), formatRelativeDate(video.createdAt)].filter(Boolean).join(' • ');

    return (
        <article className={`video-card video-card--${layout}`}>
            <Link to={href} state={{ video }} className="video-card__thumb" tabIndex={-1} aria-hidden>
                <Thumbnail videoId={video.id} alt="" />
            </Link>
            <div className="video-card__body">
                {layout === 'grid' && <UserAvatar name={channelLabel(video)} size={36} />}
                <div className="video-card__text">
                    <Link to={href} state={{ video }} className="video-card__title" title={video.title}>
                        {video.title}
                    </Link>
                    {layout === 'row' && meta && <div className="video-card__meta">{meta}</div>}
                    <div className="video-card__channel">
                        {layout === 'row' && <UserAvatar name={channelLabel(video)} size={24} />}
                        {channelLabel(video)}
                    </div>
                    {layout === 'grid' && meta && <div className="video-card__meta">{meta}</div>}
                    {layout === 'row' && video.description && (
                        <p className="video-card__description">{video.description}</p>
                    )}
                    {layout === 'row' && categoryTitle(video.category) && (
                        <span className="video-card__badge">{categoryTitle(video.category)}</span>
                    )}
                </div>
            </div>
        </article>
    );
}

export function VideoCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'row' }) {
    return (
        <div className={`video-card video-card--${layout}`} aria-hidden>
            <Skeleton variant="rounded" className="video-card__thumb video-card__thumb--skeleton" />
            <div className="video-card__body">
                {layout === 'grid' && <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />}
                <div className="video-card__text" style={{ flex: 1 }}>
                    <Skeleton variant="text" width="90%" sx={{ fontSize: 16 }} />
                    <Skeleton variant="text" width="60%" />
                </div>
            </div>
        </div>
    );
}

export default VideoCard;
