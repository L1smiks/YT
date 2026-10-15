import { Avatar } from '@mui/material';

const PALETTE = ['#e9573f', '#f6a623', '#3bb273', '#2f9bd6', '#7a5af8', '#d6458b', '#11a39b', '#c77b30'];

function colorFor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return PALETTE[Math.abs(hash) % PALETTE.length];
}

type UserAvatarProps = {
    name: string | null | undefined;
    size?: number;
};

/** Letter avatar with a stable colour per user (the backend has no profile pictures yet). */
function UserAvatar({ name, size = 36 }: UserAvatarProps) {
    const label = name?.trim() || '?';
    return (
        <Avatar
            alt={label}
            sx={{
                width: size,
                height: size,
                fontSize: size * 0.42,
                fontWeight: 600,
                bgcolor: colorFor(label),
                color: '#fff',
            }}
        >
            {label.charAt(0).toUpperCase()}
        </Avatar>
    );
}

export default UserAvatar;
