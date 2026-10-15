import { Suspense, useEffect, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Drawer, LinearProgress, Snackbar, useMediaQuery } from '@mui/material';
import Header from '../../Components/Header/Header.tsx';
import SideBar from '../../Components/SideBar/SideBar.tsx';
import AuthDialog from '../../Components/AuthDialog/AuthDialog.tsx';
import BottomNav from '../../Components/BottomNav/BottomNav.tsx';
import { useUiStore } from '../../store/uiStore.ts';
import './AppLayout.scss';

type SidebarVariant = 'full' | 'mini' | 'none';

function AppLayout() {
    const location = useLocation();
    const isWide = useMediaQuery('(min-width:1200px)');
    const isTablet = useMediaQuery('(min-width:900px)');
    const isPhone = !useMediaQuery('(min-width:600px)');
    const [expanded, setExpanded] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toast = useUiStore((s) => s.toast);
    const hideToast = useUiStore((s) => s.hideToast);

    // The watch page gives all the room to the player, like YouTube does.
    const isWatchPage = location.pathname === '/video';

    let variant: SidebarVariant = 'none';
    if (!isWatchPage) {
        if (isWide) variant = expanded ? 'full' : 'mini';
        else if (isTablet) variant = 'mini';
    }

    useEffect(() => setDrawerOpen(false), [location.pathname, location.search]);

    const handleMenu = () => {
        if (isWide && !isWatchPage) setExpanded((v) => !v);
        else setDrawerOpen(true);
    };

    return (
        <div className={`app-layout app-layout--${variant}`}>
            <Header onMenuClick={handleMenu} />

            {variant !== 'none' && (
                <aside className="app-layout__sidebar">
                    <SideBar variant={variant} />
                </aside>
            )}

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                slotProps={{ paper: { className: 'app-layout__drawer' } }}
            >
                <SideBar variant="full" inDrawer onNavigate={() => setDrawerOpen(false)} />
            </Drawer>

            <main className="app-layout__main">
                <Suspense fallback={<LinearProgress className="app-layout__loading" />}>
                    <Outlet />
                </Suspense>
            </main>

            {isPhone && <BottomNav />}

            <AuthDialog />
            <Snackbar
                key={toast?.id}
                open={Boolean(toast)}
                message={toast?.message}
                autoHideDuration={3000}
                onClose={hideToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                sx={{ bottom: { xs: 72, sm: 24 } }}
            />
            <ScrollRestoration />
        </div>
    );
}

export default AppLayout;
