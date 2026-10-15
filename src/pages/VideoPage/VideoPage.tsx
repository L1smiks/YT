import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../../Components/Video/Video.tsx';
import Description from '../../Components/Description/Description.tsx';
import Comments from '../../Components/Comments/Comments.tsx';
import VideoCardCompact, { VideoCardCompactSkeleton } from '../../Components/VideoCardCompact/VideoCardCompact.tsx';
import EmptyState from '../../Components/EmptyState/EmptyState.tsx';
import { useFetch } from '../../hooks/useFetch.ts';
import { useUserStore } from '../../store/userStore.ts';
import { fetchCatalog, fetchDescription, fetchFeed, fetchVideoOwner, registerView } from '../../api/client.ts';
import type { Video } from '../../types.ts';
import { APP_NAME } from '../../config.ts';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import './VideoPage.scss';

function VideoPage() {
    const [params] = useSearchParams();
    const id = params.get('id');
    const location = useLocation();
    const userId = useUserStore((s) => s.userId);
    const fromLink = (location.state as { video?: Video } | null)?.video;

    const feed = useFetch((signal) => fetchCatalog().catch(() => fetchFeed(null, signal)), []);
    const details = useFetch(
        async (signal) => {
            if (!id) return null;
            const [description, ownerId] = await Promise.all([
                fetchDescription(id, signal),
                fetchVideoOwner(id, signal).catch(() => null),
            ]);
            return { description, ownerId };
        },
        [id],
    );

    const [counters, setCounters] = useState<{ views: number | null; likes: number | null } | null>(null);
    const countedFor = useRef<string | null>(null);

    // Count one view per opened video (the ref also guards against StrictMode double effects).
    useEffect(() => {
        if (!id || countedFor.current === id) return;
        countedFor.current = id;
        setCounters(null);
        registerView(id, userId)
            .then(setCounters)
            .catch(() => undefined);
    }, [id, userId]);

    const fromFeed = feed.data?.find((v) => v.id === id);
    const base = fromLink?.id === id ? fromLink : fromFeed;
    const video: Video | null = id
        ? {
              id,
              title: base?.title ?? '',
              description: details.data?.description ?? base?.description ?? '',
              ownerId: details.data?.ownerId ?? base?.ownerId ?? null,
              ownerName: base?.ownerName ?? fromFeed?.ownerName ?? null,
              category: base?.category ?? null,
              views: counters?.views ?? base?.views ?? null,
              likes: counters?.likes ?? base?.likes ?? null,
              dislikes: base?.dislikes ?? null,
              createdAt: base?.createdAt ?? fromFeed?.createdAt ?? null,
          }
        : null;

    useEffect(() => {
        document.title = video?.title ? `${video.title} — ${APP_NAME}` : APP_NAME;
        return () => {
            document.title = APP_NAME;
        };
    }, [video?.title]);

    if (!id || (details.error && !base)) {
        return (
            <EmptyState
                icon={<VideocamOffOutlinedIcon />}
                title="Видео недоступно"
                description="Возможно, его удалили или ссылка неверна."
            />
        );
    }

    const related = (feed.data ?? []).filter((v) => v.id !== id).slice(0, 20);

    return (
        <div className="video-page">
            <div className="video-page__primary">
                <VideoPlayer key={id} videoId={id} />
                <Description key={`details-${id}`} video={video!}loading={!base && feed.loading} />
                <Comments key={`comments-${id}`} videoId={id} />
            </div>
            <aside className="video-page__secondary" aria-label="Другие видео">
                <h2 className="video-page__secondary-title">Смотрите также</h2>
                {feed.loading
                    ? Array.from({ length: 8 }, (_, i) => <VideoCardCompactSkeleton key={i} />)
                    : related.map((v) => <VideoCardCompact key={v.id} video={v} />)}
            </aside>
        </div>
    );
}

export default VideoPage;
