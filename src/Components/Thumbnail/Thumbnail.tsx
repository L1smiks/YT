import { useState } from 'react';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { thumbnailUrl } from '../../api/client.ts';
import './Thumbnail.scss';

type ThumbnailProps = {
    videoId: string;
    alt: string;
};

/** Video preview image that fades in and falls back to a placeholder when missing. */
function Thumbnail({ videoId, alt }: ThumbnailProps) {
    const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

    return (
        <div className={`thumbnail thumbnail--${state}`}>
            {state !== 'error' && (
                <img
                    src={thumbnailUrl(videoId)}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setState('loaded')}
                    onError={() => setState('error')}
                />
            )}
            {state === 'error' && <PlayCircleOutlineIcon className="thumbnail__fallback" />}
        </div>
    );
}

export default Thumbnail;
