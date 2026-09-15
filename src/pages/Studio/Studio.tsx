import './Studio.scss'
import DownloadVideo from '../../Components/DownloadVideo/DownloadVideo.tsx'
import Header from '../../Components/Header/Header.tsx'
import SideBar from '../../Components/SideBar/SideBar.tsx'
import { useState } from 'react'

function Studio() {
    return (
        <>
        <Header/>
        <SideBar/>
        <DownloadVideo/>
        </>
    )
}

export default Studio;