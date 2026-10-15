import { useState } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { thumbnailUrl, videoStreamUrl } from '../../api/client.ts';
import './Video.scss';

type VideoPlayerProps = {
    videoId: string;
};

function VideoPlayer({ videoId }: VideoPlayerProps) {
    const [failed, setFailed] = useState(false);

    return (
        <div className="player">
            {failed ? (
                <div className="player__error">
                    <ErrorOutlineIcon />
                    <p>Не удалось воспроизвести видео</p>
                </div>
            ) : (
                <video
                    className="player__video"
                    src={videoStreamUrl(videoId)}
                    poster={thumbnailUrl(videoId)}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onError={() => setFailed(true)}
                >
                    Ваш браузер не поддерживает воспроизведение видео.
                </video>
            )}
        </div>
    );
}

export default VideoPlayer;
