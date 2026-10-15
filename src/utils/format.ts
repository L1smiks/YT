import type { Video } from '../types.ts';

function plural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('ru-RU');

export function formatCount(n: number | null | undefined): string {
    if (n === null || n === undefined) return '';
    return n < 10_000 ? full.format(n) : compact.format(n);
}

export function formatViews(n: number | null | undefined, detailed = false): string {
    if (n === null || n === undefined) return '';
    const value = detailed ? full.format(n) : formatCount(n);
    return `${value} ${plural(n, 'просмотр', 'просмотра', 'просмотров')}`;
}

const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['week', 7 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
];

export function formatRelativeDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const seconds = (date.getTime() - Date.now()) / 1000;
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
    }
    return 'только что';
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function pluralComments(n: number): string {
    return `${full.format(n)} ${plural(n, 'комментарий', 'комментария', 'комментариев')}`;
}

/** Display name of the video's channel. */
export function channelLabel(video: Video): string {
    if (video.ownerName) return video.ownerName;
    return video.ownerId ? `Канал #${video.ownerId}` : 'Неизвестный автор';
}
