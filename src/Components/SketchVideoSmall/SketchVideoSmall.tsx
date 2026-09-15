import './SketchVideoSmall.scss'
import { useState } from 'react';

type VideoSmall = {
    id:string;
    title:string;
    thumbnail:string;
}

function SketchVideoSmall(props:VideoSmall) {
    return (
        <div className='sketchvideo__wrapper'>
            <a href={`video?id=${props.id}`} className='sketchvideo__wrapper-video'>
                <img className='sketchvideo__img' src={props.thumbnail} alt="" />
            </a>
            <div className='sketchvideo__wrapper-text'>
                <p>{props.title}</p>
                <p>Канал</p>
                <span>Просмотры </span>
                <span>Дата:</span>
            </div>

        </div>
    )
}

export default SketchVideoSmall;