import type { ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import SentimentVerySatisfiedOutlinedIcon from '@mui/icons-material/SentimentVerySatisfiedOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import { CATEGORIES, APP_NAME, type CategoryValue } from '../../config.ts';
import './SideBar.scss';

const CATEGORY_ICONS: Record<CategoryValue, ReactNode> = {
    Videogames: <SportsEsportsOutlinedIcon />,
    Humor: <SentimentVerySatisfiedOutlinedIcon />,
    Scienty: <ScienceOutlinedIcon />,
    Films: <MovieOutlinedIcon />,
    Music: <MusicNoteOutlinedIcon />,
};

const MAIN_LINKS = [
    { to: '/', label: 'Главная', shortLabel: 'Главная', icon: <HomeOutlinedIcon />, activeIcon: <HomeIcon /> },
    { to: '/studio', label: 'Студия', shortLabel: 'Студия', icon: <VideoCallOutlinedIcon />, activeIcon: <VideoCallIcon /> },
    { to: '/profile', label: 'Мой канал', shortLabel: 'Канал', icon: <AccountBoxOutlinedIcon />, activeIcon: <AccountBoxIcon /> },
];

type SideBarProps = {
    variant: 'full' | 'mini';
    inDrawer?: boolean;
    onNavigate?: () => void;
};

function SideBar({ variant, inDrawer, onNavigate }: SideBarProps) {
    const location = useLocation();
    const [params] = useSearchParams();
    const activeCategory = location.pathname === '/' ? params.get('category') : null;

    return (
        <nav className={`sidebar sidebar--${variant}`} aria-label="Основная навигация">
            {inDrawer && (
                <Link to="/" className="sidebar__brand" onClick={onNavigate}>
                    <img src="/logo.png" alt="" width={28} height={28} />
                    <span>{APP_NAME}</span>
                </Link>
            )}

            <ul className="sidebar__section">
                {MAIN_LINKS.map((link) => {
                    // "Home" is only active when no category filter is applied.
                    const isActive =
                        link.to === '/' ? location.pathname === '/' && !activeCategory : location.pathname === link.to;
                    return (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
                                onClick={onNavigate}
                            >
                                <span className="sidebar__icon">{isActive ? link.activeIcon : link.icon}</span>
                                <span className="sidebar__label">{variant === 'mini' ? link.shortLabel : link.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {variant === 'full' && (
                <>
                    <hr className="sidebar__divider" />
                    <h2 className="sidebar__title">Категории</h2>
                    <ul className="sidebar__section">
                        {CATEGORIES.map((c) => (
                            <li key={c.value}>
                                <Link
                                    to={`/?category=${c.value}`}
                                    className={`sidebar__item${activeCategory === c.value ? ' sidebar__item--active' : ''}`}
                                    onClick={onNavigate}
                                >
                                    <span className="sidebar__icon">{CATEGORY_ICONS[c.value]}</span>
                                    <span className="sidebar__label">{c.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <hr className="sidebar__divider" />
                    <p className="sidebar__footer">© {new Date().getFullYear()} {APP_NAME}</p>
                </>
            )}
        </nav>
    );
}

export default SideBar;
