import { Link } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import Thumbnail from '../Thumbnail/Thumbnail.tsx';
import { channelLabel, formatRelativeDate, formatViews } from '../../utils/format.ts';
import type { Video } from '../../types.ts';
import './VideoCardCompact.scss';

/** Small horizontal card for the "up next" column on the watch page. */
function VideoCardCompact({ video }: { video: Video }) {
    const meta = [formatViews(video.views), formatRelativeDate(video.createdAt)].filter(Boolean).join(' • ');

    return (
        <Link to={`/video?id=${video.id}`} state={{ video }} className="video-compact">
            <div className="video-compact__thumb">
                <Thumbnail videoId={video.id} alt="" />
            </div>
            <div className="video-compact__text">
                <h3 className="video-compact__title" title={video.title}>
                    {video.title}
                </h3>
                <div className="video-compact__meta">{channelLabel(video)}</div>
                {meta && <div className="video-compact__meta">{meta}</div>}
            </div>
        </Link>
    );
}

export function VideoCardCompactSkeleton() {
    return (
        <div className="video-compact" aria-hidden>
            <Skeleton variant="rounded" className="video-compact__thumb" sx={{ height: 'auto' }} />
            <div className="video-compact__text" style={{ flex: 1 }}>
                <Skeleton variant="text" width="95%" />
                <Skeleton variant="text" width="60%" />
            </div>
        </div>
    );
}

export default VideoCardCompact;
