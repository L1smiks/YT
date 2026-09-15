import SideBar from '../../Components/SideBar/SideBar.tsx'
import SketchVideoBig from '../../Components/SketchVideoBig/SketchVideoBig.tsx';
import Header from '../../Components/Header/Header.tsx';
import Model from '../../Components/Model/Model.tsx'
import { useEffect, useState } from 'react';
import './SearchPage.scss'
import { useSearchParams } from 'react-router-dom';

interface Video {
  id:string;
  title:string;
  thumbnailURL:string;
  description:string;
  }


function SearchPage() {
  const [videos,setVideo] = useState<Video[]>([]); 
  const [params] = useSearchParams();
  let queryvalue = params.get("q");
  useEffect (() => {
    const url = `http://localhost:3777/api/search?q=${queryvalue}`;
    fetch(url)
    .then(response => {
      if (response.ok) {
        response.json()
        .then(data => {
          console.log(data)
          setVideo(data);
        })
      } else {
        throw Error('error')
      }})
  }, [])
  return (
    <div className="searchpage__wrapper">
      <Header/>
      <Model/>
      <SideBar/>
      <div className='searchpage__wrapper-wrap'>
        {videos.map((videos) => (
          <SketchVideoBig key = {videos.id} id = {videos.id} thumbnail = {videos.thumbnailURL} title = {videos.title} description = {videos.description}></SketchVideoBig>
        ))}
      </div>
    </div>
  )
}

export default SearchPage;