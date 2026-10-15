import { useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import VideoCard, { VideoCardSkeleton } from '../../Components/VideoCard/VideoCard.tsx';
import EmptyState from '../../Components/EmptyState/EmptyState.tsx';
import { useFetch } from '../../hooks/useFetch.ts';
import { errorMessage, searchVideos } from '../../api/client.ts';
import './SearchPage.scss';

function SearchPage() {
    const [params] = useSearchParams();
    const query = (params.get('q') ?? '').trim();
    const { data: videos, loading, error, reload } = useFetch(
        (signal) => (query ? searchVideos(query, signal) : Promise.resolve([])),
        [query],
    );

    let content;
    if (!query) {
        content = <EmptyState icon={<SearchOffOutlinedIcon />} title="Введите запрос" description="Найдите видео по названию или описанию." />;
    } else if (error) {
        content = (
            <EmptyState
                icon={<CloudOffOutlinedIcon />}
                title="Поиск не удался"
                description={errorMessage(error)}
                action={<Button variant="outlined" onClick={reload}>Повторить</Button>}
            />
        );
    } else if (loading) {
        content = Array.from({ length: 6 }, (_, i) => <VideoCardSkeleton key={i} layout="row" />);
    } else if (!videos?.length) {
        content = (
            <EmptyState
                icon={<SearchOffOutlinedIcon />}
                title="Ничего не найдено"
                description={`По запросу «${query}» нет результатов. Попробуйте другие слова.`}
            />
        );
    } else {
        content = videos.map((video) => <VideoCard key={video.id} video={video} layout="row" />);
    }

    return (
        <div className="search-page">
            {query && !loading && !error && Boolean(videos?.length) && (
                <p className="search-page__summary">
                    Результаты по запросу <strong>«{query}»</strong>
                </p>
            )}
            <div className="search-page__results">{content}</div>
        </div>
    );
}

export default SearchPage;
