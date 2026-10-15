import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import UserAvatar from '../../Components/UserAvatar/UserAvatar.tsx';
import VideoGrid from '../../Components/VideoGrid/VideoGrid.tsx';
import EmptyState from '../../Components/EmptyState/EmptyState.tsx';
import { useFetch } from '../../hooks/useFetch.ts';
import { useCurrentUser, useUserStore } from '../../store/userStore.ts';
import { useUiStore } from '../../store/uiStore.ts';
import { fetchCatalog } from '../../api/client.ts';
import { formatViews } from '../../utils/format.ts';
import './Profile.scss';

function Profile() {
    const user = useCurrentUser();
    const navigate = useNavigate();
    const logout = useUserStore((s) => s.logout);
    const openAuth = useUiStore((s) => s.openAuth);
    const userId = user?.id;

    const { data, loading } = useFetch(
        async () => {
            if (!userId) return [];
            const videos = await fetchCatalog();
            return videos.filter((v) => v.ownerId === userId);
        },
        [userId],
    );

    if (!user) {
        return (
            <EmptyState
                icon={<AccountCircleOutlinedIcon />}
                title="Вы не вошли в аккаунт"
                description="Войдите, чтобы управлять своим каналом и загружать видео."
                action={<Button variant="contained" onClick={() => openAuth('login')}>Войти</Button>}
            />
        );
    }

    const videos = data ?? [];
    const totalViews = videos.reduce((sum, v) => sum + (v.views ?? 0), 0);
    const stats = [
        `@${user.username.toLowerCase()}`,
        loading ? null : `${videos.length} видео`,
        loading || !totalViews ? null : formatViews(totalViews),
    ].filter(Boolean);

    return (
        <div className="profile">
            <div className="profile__banner" />
            <header className="profile__header">
                <UserAvatar name={user.username} size={128} />
                <div className="profile__info">
                    <h1 className="profile__name">{user.username}</h1>
                    <p className="profile__stats">{stats.join(' • ')}</p>
                    <div className="profile__actions">
                        <Button variant="contained" color="inherit" component={Link} to="/studio" startIcon={<VideoCallOutlinedIcon />} className="profile__btn">
                            Загрузить видео
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            startIcon={<LogoutIcon />}
                            className="profile__btn"
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                        >
                            Выйти
                        </Button>
                    </div>
                </div>
            </header>

            <nav className="profile__tabs">
                <span className="profile__tab profile__tab--active">Видео</span>
            </nav>

            <div className="profile__content">
                {!loading && videos.length === 0 ? (
                    <EmptyState
                        icon={<VideoLibraryOutlinedIcon />}
                        title="Здесь появятся ваши видео"
                        description="Загрузите первое видео, чтобы начать вести канал."
                        action={<Button variant="contained" component={Link} to="/studio">Загрузить видео</Button>}
                    />
                ) : (
                    <VideoGrid videos={videos} loading={loading} skeletonCount={4} />
                )}
            </div>
        </div>
    );
}

export default Profile;
