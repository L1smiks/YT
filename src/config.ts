export const APP_NAME = 'KotTube';

/** Base URL of the backend. Override with VITE_API_URL in `.env.local`. */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:3777').replace(/\/$/, '');

export const CATEGORIES = [
    { value: 'Videogames', title: 'Видеоигры' },
    { value: 'Humor', title: 'Юмор' },
    { value: 'Scienty', title: 'Наука' },
    { value: 'Films', title: 'Фильмы' },
    { value: 'Music', title: 'Музыка' },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]['value'];

export function categoryTitle(value: string | null | undefined): string | undefined {
    return CATEGORIES.find((c) => c.value === value)?.title;
}
