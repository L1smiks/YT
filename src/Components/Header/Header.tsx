import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import Search from '../Search/Search.tsx';
import UserAvatar from '../UserAvatar/UserAvatar.tsx';
import { useCurrentUser, useUserStore } from '../../store/userStore.ts';
import { useUiStore } from '../../store/uiStore.ts';
import { APP_NAME } from '../../config.ts';
import './Header.scss';

type HeaderProps = {
    onMenuClick: () => void;
};

function Header({ onMenuClick }: HeaderProps) {
    const navigate = useNavigate();
    const user = useCurrentUser();
    const logout = useUserStore((s) => s.logout);
    const openAuth = useUiStore((s) => s.openAuth);
    const showToast = useUiStore((s) => s.showToast);
    const isCompact = !useMediaQuery('(min-width:656px)');
    const [mobileSearch, setMobileSearch] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const closeMenu = () => setMenuAnchor(null);
    const handleLogout = () => {
        closeMenu();
        logout();
        showToast('Вы вышли из аккаунта');
        navigate('/');
    };

    if (isCompact && mobileSearch) {
        return (
            <header className="header header--search">
                <IconButton aria-label="Назад" onClick={() => setMobileSearch(false)}>
                    <ArrowBackIcon />
                </IconButton>
                <Search autoFocus onSubmitted={() => setMobileSearch(false)} />
            </header>
        );
    }

    return (
        <header className="header">
            <div className="header__start">
                <IconButton aria-label="Меню" onClick={onMenuClick}>
                    <MenuIcon />
                </IconButton>
                <Link to="/" className="header__logo" aria-label={`${APP_NAME} — главная`}>
                    <img src="/logo.png" alt="" width={30} height={30} />
                    <span className="header__logo-text">{APP_NAME}</span>
                </Link>
            </div>

            {!isCompact && (
                <div className="header__center">
                    <Search />
                </div>
            )}

            <div className="header__end">
                {isCompact && (
                    <IconButton aria-label="Поиск" onClick={() => setMobileSearch(true)}>
                        <SearchIcon />
                    </IconButton>
                )}

                {isCompact ? (
                    <Tooltip title="Создать">
                        <IconButton aria-label="Создать" component={Link} to="/studio">
                            <VideoCallOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Button
                        component={Link}
                        to="/studio"
                        variant="contained"
                        color="inherit"
                        startIcon={<VideoCallOutlinedIcon />}
                        className="header__create"
                    >
                        Создать
                    </Button>
                )}

                {user ? (
                    <>
                        <IconButton
                            aria-label="Меню аккаунта"
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            sx={{ p: 0.5 }}
                        >
                            <UserAvatar name={user.username} size={32} />
                        </IconButton>
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={closeMenu}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{ paper: { sx: { minWidth: 240, mt: 1 } } }}
                        >
                            <div className="header__account">
                                <UserAvatar name={user.username} size={40} />
                                <div>
                                    <div className="header__account-name">{user.username}</div>
                                    <div className="header__account-handle">@{user.username.toLowerCase()}</div>
                                </div>
                            </div>
                            <Divider />
                            <MenuItem component={Link} to="/profile" onClick={closeMenu}>
                                <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                                Мой канал
                            </MenuItem>
                            <MenuItem component={Link} to="/studio" onClick={closeMenu}>
                                <ListItemIcon><VideoCallOutlinedIcon fontSize="small" /></ListItemIcon>
                                Загрузить видео
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                Выйти
                            </MenuItem>
                        </Menu>
                    </>
                ) : isCompact ? (
                    <IconButton aria-label="Войти" onClick={() => openAuth('login')}>
                        <AccountCircleOutlinedIcon />
                    </IconButton>
                ) : (
                    <Button
                        variant="outlined"
                        startIcon={<AccountCircleOutlinedIcon />}
                        onClick={() => openAuth('login')}
                        className="header__signin"
                    >
                        Войти
                    </Button>
                )}
            </div>
        </header>
    );
}

export default Header;
