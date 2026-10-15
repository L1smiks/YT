import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme.ts';
import AppLayout from './layout/AppLayout/AppLayout.tsx';
import HomePage from './pages/HomePage/HomePage.tsx';
import './styles/global.scss';

// Secondary pages are loaded on demand to keep the first load small.
const VideoPage = lazy(() => import('./pages/VideoPage/VideoPage.tsx'));
const SearchPage = lazy(() => import('./pages/SearchPage/SearchPage.tsx'));
const Studio = lazy(() => import('./pages/Studio/Studio.tsx'));
const Profile = lazy(() => import('./pages/Profile/Profile.tsx'));

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/video', element: <VideoPage /> },
            { path: '/searchpage', element: <SearchPage /> },
            { path: '/studio', element: <Studio /> },
            { path: '/profile', element: <Profile /> },
            // Old URLs
            { path: '/main', element: <Navigate to="/" replace /> },
            { path: '/downloadvideo', element: <Navigate to="/studio" replace /> },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <RouterProvider router={router} />
        </ThemeProvider>
    </StrictMode>,
);
