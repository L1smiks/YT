import './VideoPage.scss'
import Video from '../../Components/Video/Video.tsx'
import Description from '../../Components/Description/Description.tsx'
import SketchVideoSmall from '../../Components/SketchVideoSmall/SketchVideoSmall.tsx'
import Comments from '../../Components/Comments/Comments.tsx'
import Header from '../../Components/Header/Header.tsx'
import SideBar from '../../Components/SideBar/SideBar.tsx'
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react'
import { useUserStore } from '../../store/storeZustand.tsx'

interface VideoPage {
  id:string;
  title:string;
  thumbnailURL:string;
}

function VideoPage() {
    const ownerID = useUserStore((state) => state.userId);
    const [videos,setVideos] = useState<VideoPage[]>([]);
    const [params] = useSearchParams();
    const id = params.get("id");
    useEffect (() => {
        const Fetches = async () => {
            const url = 'http://localhost:3777/api/listvideo?limit=20'
            const url2 = `http://localhost:3777/api/listoperations/${id}/${ownerID}`
            await fetch(url)
            .then(response => {
                if (response.ok) {
                    response.json()
                    .then(data => {
                        setVideos(data);
                    })
                } else {
                    throw Error('error')
                }
            })
            await fetch(url2)
            .then(response => {
                if (response.ok) {
                    response.json()
                    .then (data =>{
                        console.log(data)
                    })
                } else {
                    throw Error('error')
                }
            })
        }
        Fetches();
    }, [])
    return (
        <>
        <Header/>
        <SideBar/>
        <div className='videopage__wrapper'>
            <div className='videocom__wrapper'>
                <Video/>
                <Description/>
                <Comments/>
            </div>
            <div className='videobar__wrapper'>
                {videos.map((videos) => (
                    <SketchVideoSmall key = {videos.id} id = {videos.id} thumbnail = {videos.thumbnailURL} title = {videos.title}/>
                ))}
            </div>
        </div>
        </>
    )
}

export default VideoPage;