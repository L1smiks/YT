export interface Video {
    id: string;
    title: string;
    description: string;
    ownerId: string | null;
    ownerName: string | null;
    category: string | null;
    views: number | null;
    likes: number | null;
    dislikes: number | null;
    createdAt: string | null;
}

export interface Comment {
    id: string;
    content: string;
    authorName: string;
}

export interface User {
    id: string;
    username: string;
}
