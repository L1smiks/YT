import VideoCard, { VideoCardSkeleton } from '../VideoCard/VideoCard.tsx';
import type { Video } from '../../types.ts';
import './VideoGrid.scss';

type VideoGridProps = {
    videos: Video[];
    loading?: boolean;
    skeletonCount?: number;
};

function VideoGrid({ videos, loading, skeletonCount = 12 }: VideoGridProps) {
    return (
        <div className="video-grid" aria-busy={loading}>
            {loading
                ? Array.from({ length: skeletonCount }, (_, i) => <VideoCardSkeleton key={i} />)
                : videos.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
    );
}

export default VideoGrid;
