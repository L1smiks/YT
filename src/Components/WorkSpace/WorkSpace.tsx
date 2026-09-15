import { useEffect, useState } from 'react';
import Category from '../Category/Category.tsx';
import SketchVideoBig from '../SketchVideoBig/SketchVideoBig.tsx';
import './WorkSpace.scss'

interface Video {
  id:string;
  title:string;
  thumbnailURL:string;
  description:string;
}

type LetCategory =  {
  category:string;
}


function WorkSpace(props: LetCategory) {
  const [videos,setVideo] = useState<Video[]>([]);
  useEffect (() => {
    let limit = 20;
    let url;
    if (props.category === "") {
      url = `http://localhost:3777/api/listvideo?limit=${limit}`;
    }
    else {
      url = `http://localhost:3777/api/listvideo?limit=${limit}&category=${props.category}`
    }
    console.log(props.category)
    console.log(url);
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
  }, [props.category])
  return (
    <div className="workspace__wrapper">
      <div className='videos__parent'>
        {videos.map((videos) => (
          <SketchVideoBig key = {videos.id} id = {videos.id} thumbnail = {videos.thumbnailURL} title = {videos.title} description = {videos.description}></SketchVideoBig>
        ))}
      </div>
    </div>
  )
}

export default WorkSpace;