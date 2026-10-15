import { useState } from 'react';
import { Skeleton, Tooltip } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ReplyIcon from '@mui/icons-material/Reply';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import UserAvatar from '../UserAvatar/UserAvatar.tsx';
import { useCurrentUser } from '../../store/userStore.ts';
import { useUiStore } from '../../store/uiStore.ts';
import { dislikeVideo, errorMessage, likeVideo, subscribe, videoStreamUrl } from '../../api/client.ts';
import { channelLabel, formatCount, formatDate, formatRelativeDate, formatViews } from '../../utils/format.ts';
import { categoryTitle } from '../../config.ts';
import type { Video } from '../../types.ts';
import './Description.scss';

type DescriptionProps = {
    video: Video;
    loading?: boolean;
};

type Reaction = 'like' | 'dislike' | null;

function Description({ video, loading }: DescriptionProps) {
    const user = useCurrentUser();
    const openAuth = useUiStore((s) => s.openAuth);
    const showToast = useUiStore((s) => s.showToast);
    const [expanded, setExpanded] = useState(false);
    const [reaction, setReaction] = useState<Reaction>(null);
    const [likes, setLikes] = useState<number | null>(null);
    const [dislikes, setDislikes] = useState<number | null>(null);
    const [subscribed, setSubscribed] = useState(false);

    const isOwnVideo = Boolean(user && video.ownerId && user.id === video.ownerId);
    const likeCount = likes ?? video.likes;
    const dislikeCount = dislikes ?? video.dislikes;

    function requireUser(): boolean {
        if (user) return true;
        openAuth('login');
        return false;
    }

    async function handleLike() {
        if (!requireUser() || reaction) return;
        setReaction('like');
        try {
            setLikes(await likeVideo(video.id, user!.id));
        } catch (err) {
            setReaction(null);
            showToast(errorMessage(err, 'Не удалось поставить лайк'));
        }
    }

    async function handleDislike() {
        if (!requireUser() || reaction) return;
        setReaction('dislike');
        try {
            setDislikes(await dislikeVideo(video.id, user!.id));
        } catch (err) {
            setReaction(null);
            showToast(errorMessage(err, 'Не удалось отправить оценку'));
        }
    }

    async function handleSubscribe() {
        if (!requireUser() || subscribed || !video.ownerId) return;
        setSubscribed(true);
        try {
            await subscribe(user!.id, video.ownerId);
            showToast(`Вы подписались на канал ${channelLabel(video)}`);
        } catch (err) {
            setSubscribed(false);
            showToast(errorMessage(err, 'Не удалось подписаться'));
        }
    }

    async function handleShare() {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: video.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            showToast('Ссылка скопирована');
        } catch {
            /* the user closed the share sheet */
        }
    }

    const viewsLine = expanded ? formatViews(video.views, true) : formatViews(video.views);
    const dateLine = expanded ? formatDate(video.createdAt) : formatRelativeDate(video.createdAt);
    const category = categoryTitle(video.category);

    return (
        <section className="details">
            {loading ? (
                <Skeleton variant="text" width="70%" sx={{ fontSize: 22 }} />
            ) : (
                <h1 className="details__title">{video.title || 'Без названия'}</h1>
            )}

            <div className="details__bar">
                <div className="details__channel">
                    <UserAvatar name={channelLabel(video)} size={40} />
                    <div className="details__channel-text">
                        <div className="details__channel-name">{channelLabel(video)}</div>
                        {isOwnVideo && <div className="details__channel-sub">Это ваше видео</div>}
                    </div>
                    {!isOwnVideo && video.ownerId && (
                        <button
                            type="button"
                            className={`details__subscribe${subscribed ? ' details__subscribe--active' : ''}`}
                            onClick={handleSubscribe}
                        >
                            {subscribed && <NotificationsNoneIcon fontSize="small" />}
                            {subscribed ? 'Вы подписаны' : 'Подписаться'}
                        </button>
                    )}
                </div>

                <div className="details__actions">
                    <div className="details__rating">
                        <Tooltip title="Нравится">
                            <button type="button" className="details__action" onClick={handleLike} aria-pressed={reaction === 'like'}>
                                {reaction === 'like' ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />}
                                {likeCount !== null && <span>{formatCount(likeCount)}</span>}
                            </button>
                        </Tooltip>
                        <span className="details__rating-divider" />
                        <Tooltip title="Не нравится">
                            <button type="button" className="details__action" onClick={handleDislike} aria-pressed={reaction === 'dislike'}>
                                {reaction === 'dislike' ? <ThumbDownAltIcon fontSize="small" /> : <ThumbDownOffAltIcon fontSize="small" />}
                                {dislikeCount !== null && reaction === 'dislike' && <span>{formatCount(dislikeCount)}</span>}
                            </button>
                        </Tooltip>
                    </div>
                    <button type="button" className="details__action details__action--pill" onClick={handleShare}>
                        <ReplyIcon fontSize="small" sx={{ transform: 'scaleX(-1)' }} />
                        <span>Поделиться</span>
                    </button>
                    <a className="details__action details__action--pill" href={videoStreamUrl(video.id)} download>
                        <DownloadIcon fontSize="small" />
                        <span>Скачать</span>
                    </a>
                </div>
            </div>

            <div
                className={`details__box${expanded ? ' details__box--expanded' : ''}`}
                onClick={() => !expanded && setExpanded(true)}
                role={expanded ? undefined : 'button'}
                tabIndex={expanded ? undefined : 0}
                onKeyDown={(e) => {
                    if (!expanded && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setExpanded(true);
                    }
                }}
            >
                <div className="details__box-meta">
                    {[viewsLine, dateLine].filter(Boolean).join('  ')}
                    {category && <span className="details__box-tag">#{category}</span>}
                </div>
                <p className="details__box-text">{video.description || 'Описание отсутствует.'}</p>
                <button
                    type="button"
                    className="details__box-toggle"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((v) => !v);
                    }}
                >
                    {expanded ? 'Свернуть' : 'Ещё'}
                </button>
            </div>
        </section>
    );
}

export default Description;
