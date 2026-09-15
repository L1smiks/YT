import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import OwnerPage from './pages/OwnerPage/OwnerPage.tsx'
import Profile from './pages/Profile/Profile.tsx'
import VideoPage from './pages/VideoPage/VideoPage.tsx'
import Model from './Components/Model/Model.tsx'
import Studio from './pages/Studio/Studio.tsx'
import SearchPage from './pages/SearchPage/SearchPage.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'


const router = createBrowserRouter([
  {
    path: "/main",
    element: <OwnerPage />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/video",
    element: <VideoPage />,
  },
  {
    path: "/downloadvideo",
    element: <Studio />,
  },
  {
    path: "/searchpage",
    element: <SearchPage />,
  },
  {
    path: "*",
    element: <Navigate to="/main" replace/>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Model/>
    <RouterProvider router={router}/>
  </StrictMode>,
)

