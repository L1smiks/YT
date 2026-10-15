import { NavLink } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import './BottomNav.scss';

const ITEMS = [
    { to: '/', label: 'Главная', icon: <HomeOutlinedIcon />, activeIcon: <HomeIcon /> },
    { to: '/studio', label: 'Создать', icon: <AddCircleOutlineIcon className="bottom-nav__create" />, activeIcon: <AddCircleOutlineIcon className="bottom-nav__create" /> },
    { to: '/profile', label: 'Вы', icon: <AccountBoxOutlinedIcon />, activeIcon: <AccountBoxIcon /> },
];

/** Tab bar shown on phones instead of the sidebar. */
function BottomNav() {
    return (
        <nav className="bottom-nav" aria-label="Навигация">
            {ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} end className="bottom-nav__item">
                    {({ isActive }) => (
                        <>
                            {isActive ? item.activeIcon : item.icon}
                            <span>{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}

export default BottomNav;
