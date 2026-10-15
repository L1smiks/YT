import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import CategoryBar from '../../Components/CategoryBar/CategoryBar.tsx';
import VideoGrid from '../../Components/VideoGrid/VideoGrid.tsx';
import EmptyState from '../../Components/EmptyState/EmptyState.tsx';
import { useFetch } from '../../hooks/useFetch.ts';
import { errorMessage, fetchFeed } from '../../api/client.ts';
import { categoryTitle } from '../../config.ts';
import './HomePage.scss';

function HomePage() {
    const [params, setParams] = useSearchParams();
    const category = params.get('category');
    const { data: videos, loading, error, reload } = useFetch((signal) => fetchFeed(category, signal), [category]);

    function changeCategory(value: string | null) {
        setParams(value ? { category: value } : {});
    }

    let content;
    if (error) {
        content = (
            <EmptyState
                icon={<CloudOffOutlinedIcon />}
                title="Не удалось загрузить видео"
                description={errorMessage(error)}
                action={<Button variant="outlined" onClick={reload}>Повторить</Button>}
            />
        );
    } else if (!loading && videos?.length === 0) {
        content = (
            <EmptyState
                icon={<VideoLibraryOutlinedIcon />}
                title={category ? `В категории «${categoryTitle(category)}» пока пусто` : 'Здесь пока нет видео'}
                description="Станьте первым — загрузите своё видео в студии."
                action={<Button variant="contained" component={Link} to="/studio">Загрузить видео</Button>}
            />
        );
    } else {
        content = <VideoGrid videos={videos ?? []} loading={loading} />;
    }

    return (
        <div className="home-page">
            <div className="home-page__chips">
                <CategoryBar value={category} onChange={changeCategory} />
            </div>
            <div className="home-page__content">{content}</div>
        </div>
    );
}

export default HomePage;
