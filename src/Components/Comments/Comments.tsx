import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, CircularProgress, Skeleton } from '@mui/material';
import UserAvatar from '../UserAvatar/UserAvatar.tsx';
import { useFetch } from '../../hooks/useFetch.ts';
import { useCurrentUser } from '../../store/userStore.ts';
import { useUiStore } from '../../store/uiStore.ts';
import { errorMessage, fetchComments, postComment } from '../../api/client.ts';
import { pluralComments } from '../../utils/format.ts';
import type { Comment } from '../../types.ts';
import './Comments.scss';

const MAX_LENGTH = 2000;

function Comments({ videoId }: { videoId: string }) {
    const user = useCurrentUser();
    const openAuth = useUiStore((s) => s.openAuth);
    const showToast = useUiStore((s) => s.showToast);
    const { data, loading, error } = useFetch((signal) => fetchComments(videoId, signal), [videoId]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');
    const [focused, setFocused] = useState(false);
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (data) setComments(data);
    }, [data]);

    // Auto-grow the textarea with its content.
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [text]);

    function reset() {
        setText('');
        setFocused(false);
        textareaRef.current?.blur();
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const content = text.trim();
        if (!content || !user) return;
        setSending(true);
        try {
            const id = await postComment(videoId, user, content);
            setComments((list) => [{ id, content, authorName: user.username }, ...list]);
            reset();
        } catch (err) {
            showToast(errorMessage(err, 'Не удалось отправить комментарий'));
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="comments" aria-label="Комментарии">
            <h2 className="comments__title">{loading ? 'Комментарии' : pluralComments(comments.length)}</h2>

            {user ? (
                <form className="comments__form" onSubmit={handleSubmit}>
                    <UserAvatar name={user.username} size={40} />
                    <div className="comments__form-body">
                        <textarea
                            ref={textareaRef}
                            className="comments__input"
                            placeholder="Введите комментарий"
                            rows={1}
                            maxLength={MAX_LENGTH}
                            value={text}
                            onFocus={() => setFocused(true)}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
                            }}
                        />
                        {focused && (
                            <div className="comments__form-actions">
                                <Button color="inherit" onClick={reset} disabled={sending}>
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!text.trim() || sending}
                                    startIcon={sending ? <CircularProgress size={16} color="inherit" /> : undefined}
                                >
                                    Оставить комментарий
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            ) : (
                <button type="button" className="comments__signin" onClick={() => openAuth('login')}>
                    <UserAvatar name="?" size={40} />
                    <span>Войдите, чтобы оставить комментарий</span>
                </button>
            )}

            {error ? (
                <p className="comments__empty">{errorMessage(error, 'Не удалось загрузить комментарии')}</p>
            ) : loading ? (
                <ul className="comments__list">
                    {Array.from({ length: 3 }, (_, i) => (
                        <li key={i} className="comments__item">
                            <Skeleton variant="circular" width={40} height={40} />
                            <div style={{ flex: 1 }}>
                                <Skeleton variant="text" width={120} />
                                <Skeleton variant="text" width="80%" />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : comments.length === 0 ? (
                <p className="comments__empty">Комментариев пока нет. Будьте первым!</p>
            ) : (
                <ul className="comments__list">
                    {comments.map((c) => (
                        <li key={c.id} className="comments__item">
                            <UserAvatar name={c.authorName} size={40} />
                            <div className="comments__item-body">
                                <div className="comments__author">@{c.authorName}</div>
                                <p className="comments__content">{c.content}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default Comments;
