import { API_URL } from '../config';
import type { Comment, User, Video } from '../types';

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const DEFAULT_TIMEOUT_MS = 15_000;

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    init.signal?.addEventListener('abort', onAbort);

    try {
        const response = await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
        const text = await response.text();
        let data: unknown = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = text;
        }
        if (!response.ok) {
            const message =
                typeof data === 'object' && data && 'error' in data ? String((data as { error: unknown }).error) : response.statusText;
            throw new ApiError(message || 'Ошибка запроса', response.status);
        }
        return data as T;
    } catch (err) {
        if (err instanceof ApiError) throw err;
        if (controller.signal.aborted && !init.signal?.aborted) {
            throw new ApiError('Сервер не отвечает', 408);
        }
        throw err;
    } finally {
        clearTimeout(timer);
        init.signal?.removeEventListener('abort', onAbort);
    }
}

function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });
}

/* ---------- URLs ---------- */

export const thumbnailUrl = (id: string) => `${API_URL}/api/video/thumbnail/${id}`;
export const videoStreamUrl = (id: string) => `${API_URL}/api/video/${id}`;

/* ---------- Normalisation ---------- */

type RawVideo = Record<string, unknown>;

const toStr = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : String(v));
const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

export function normalizeVideo(raw: RawVideo): Video {
    return {
        id: String(raw.id),
        title: toStr(raw.title) ?? 'Без названия',
        description: toStr(raw.description) ?? '',
        ownerId: toStr(raw.ownerid),
        ownerName: toStr(raw.owner_username),
        category: toStr(raw.category),
        views: toNum(raw.views),
        likes: toNum(raw.likes),
        dislikes: toNum(raw.dislikes),
        createdAt: toStr(raw.create_at),
    };
}

/* ---------- Videos ---------- */

/** Latest videos with author names (`GET /videos`). */
export async function fetchLatestVideos(limit = 24, offset = 0, signal?: AbortSignal): Promise<Video[]> {
    const rows = await request<RawVideo[]>(`/videos?limit=${limit}&offset=${offset}`, { signal });
    return rows.map(normalizeVideo);
}

/** Random videos, optionally filtered by category (`GET /api/listvideo`). */
async function fetchVideosByCategory(category: string | null, limit = 24, signal?: AbortSignal): Promise<Video[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (category) params.set('category', category);
    try {
        const rows = await request<RawVideo[]>(`/api/listvideo?${params}`, { signal });
        return rows.map(normalizeVideo);
    } catch (err) {
        // The backend answers 404 when nothing matches.
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
    }
}

let catalogCache: { at: number; promise: Promise<Video[]> } | null = null;
const CATALOG_TTL_MS = 30_000;

/** Recent videos with full metadata, cached briefly so pages can share one request. */
export function fetchCatalog(): Promise<Video[]> {
    if (!catalogCache || Date.now() - catalogCache.at > CATALOG_TTL_MS) {
        const promise = fetchLatestVideos(200, 0);
        promise.catch(() => (catalogCache = null));
        catalogCache = { at: Date.now(), promise };
    }
    return catalogCache.promise;
}

/** Fills in author names, dates and counters that some endpoints leave out. */
async function enrich(videos: Video[]): Promise<Video[]> {
    try {
        const byId = new Map((await fetchCatalog()).map((v) => [v.id, v]));
        return videos.map((v) => {
            const full = byId.get(v.id);
            if (!full) return v;
            return {
                ...v,
                ownerName: v.ownerName ?? full.ownerName,
                category: v.category ?? full.category,
                views: v.views ?? full.views,
                likes: v.likes ?? full.likes,
                dislikes: v.dislikes ?? full.dislikes,
                createdAt: v.createdAt ?? full.createdAt,
            };
        });
    } catch {
        return videos;
    }
}

/** Feed for the home page: latest videos, or a category when one is selected. */
export async function fetchFeed(category: string | null, signal?: AbortSignal): Promise<Video[]> {
    try {
        const latest = await fetchCatalog();
        return category ? latest.filter((v) => v.category === category) : latest.slice(0, 40);
    } catch (err) {
        if (signal?.aborted) throw err;
        // Fall back to the simpler endpoint if `/videos` is unavailable.
        return fetchVideosByCategory(category, 40, signal);
    }
}

export async function searchVideos(query: string, signal?: AbortSignal): Promise<Video[]> {
    const rows = await request<RawVideo[]>(`/api/search?q=${encodeURIComponent(query)}`, { signal });
    return enrich(rows.map(normalizeVideo));
}

export async function fetchDescription(id: string, signal?: AbortSignal): Promise<string> {
    const data = await request<{ description: string | null }>(`/api/description/${id}`, { signal });
    return data?.description ?? '';
}

export async function fetchVideoOwner(id: string, signal?: AbortSignal): Promise<string | null> {
    const rows = await request<{ ownerid: unknown }[]>(`/api/usid/${id}`, { signal });
    return toStr(rows[0]?.ownerid);
}

/** Registers a view and returns the current counters. */
export async function registerView(id: string, userId: string | null): Promise<{ views: number | null; likes: number | null }> {
    const rows = await request<{ views: unknown; likes: unknown }[]>(`/api/listoperations/${id}/${userId ?? 0}`);
    return { views: toNum(rows[0]?.views), likes: toNum(rows[0]?.likes) };
}

export async function likeVideo(id: string, userId: string): Promise<number | null> {
    const rows = await request<{ likes: unknown }[]>(`/api/userlike/${id}/${userId}`);
    return toNum(rows[0]?.likes);
}

export async function dislikeVideo(id: string, userId: string): Promise<number | null> {
    const rows = await request<{ dislikes: unknown }[]>(`/api/dislike/${id}/${userId}`);
    return toNum(rows[0]?.dislikes);
}

export async function subscribe(userId: string, channelId: string): Promise<void> {
    await request(`/api/subscribe/${userId}/${channelId}`);
}

export interface UploadVideoPayload {
    title: string;
    description: string;
    category: string;
    ownerId: string;
    video: File;
    thumbnail: File;
}

/** Uploads a video with progress reporting (fetch has no upload progress, so XHR is used). */
export function uploadVideo(payload: UploadVideoPayload, onProgress?: (percent: number) => void): Promise<{ video: string }> {
    const form = new FormData();
    // Text fields go first so the server has them before the file streams finish.
    form.append('name', payload.title);
    form.append('description', payload.description);
    form.append('category', payload.category);
    form.append('ownerid', payload.ownerId);
    form.append('thumbnail', payload.thumbnail);
    form.append('video', payload.video);
    catalogCache = null;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/videos/upload`);
        xhr.responseType = 'json';
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
            else reject(new ApiError(xhr.response?.error ?? 'Не удалось загрузить видео', xhr.status));
        };
        xhr.onerror = () => reject(new ApiError('Сервер недоступен', 0));
        xhr.send(form);
    });
}

/* ---------- Comments ---------- */

export async function fetchComments(videoId: string, signal?: AbortSignal): Promise<Comment[]> {
    const rows = await request<{ id: unknown; content: unknown; author_name: unknown }[]>(`/api/listcomments/${videoId}`, { signal });
    return rows
        .map((r) => ({ id: String(r.id), content: String(r.content ?? ''), authorName: toStr(r.author_name) ?? 'Аноним' }))
        .reverse();
}

export async function postComment(videoId: string, user: User, content: string): Promise<string> {
    const data = await postJson<{ comment: unknown }>(`/api/comments/upload/${videoId}`, {
        content,
        autor: user.id,
        author_name: user.username,
        video: videoId,
    });
    return String(data.comment);
}

/* ---------- Auth ---------- */

export async function login(username: string, password: string): Promise<User> {
    try {
        const data = await postJson<{ user: { id: unknown; username: unknown } }>('/login', { login: username, password });
        return { id: String(data.user.id), username: String(data.user.username) };
    } catch (err) {
        // The backend does not answer when the user is unknown, so a timeout means bad credentials.
        if (err instanceof ApiError && err.status === 408) throw new ApiError('Неверный логин или пароль', 401);
        throw err;
    }
}

export async function register(username: string, password: string, email: string): Promise<User> {
    const data = await postJson<{ newuser: { id: unknown; username: unknown } }>('/regist', { login: username, password, email });
    return { id: String(data.newuser.id), username: String(data.newuser.username) };
}

export function errorMessage(err: unknown, fallback = 'Что-то пошло не так'): string {
    if (err instanceof ApiError) return err.message;
    if (err instanceof TypeError) return 'Сервер недоступен. Проверьте, что бекенд запущен.';
    return fallback;
}
