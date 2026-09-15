import './Description.scss'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserStore } from '../../store/storeZustand.tsx'

type DescriptionViews = {
    
}

function Description() {
    const ownerID = useUserStore((state) => state.userId);
    const [description, setDescription] = useState('');
    const [usvidid, setUsVidId] = useState('');
    const [params] = useSearchParams();
    const id = params.get("id");
    const [likes, setLikes] = useState('');
    const [dislikes, setDislikes] = useState('');
    useEffect (() => {
        const Fetches = async () => {
            const url = `http://localhost:3777/api/description/${id}`;
            const url2 = `http://localhost:3777/api/usid/${id}`;
            fetch(url)
            .then(response => {
                if (response.ok) {
                    response.json()
                    .then(data => {
                        setDescription(data.description);
                })
            } else {
                throw Error('error')
            }})
            fetch(url2)
            .then(response => {
                if(response.ok) {
                    response.json()
                    .then(data => {
                        setUsVidId(data[0].ownerid)
                    })
                } else {

                }
            })
        }
        Fetches();
        console.log(ownerID)
    }, [])
    const [isExpansion, setIsExpansion] = useState(false);
    const toggleDescription = () => {setIsExpansion(!isExpansion)};
    function Likes() {
        const url = `http://localhost:3777/api/userlike/${id}/${ownerID}`
        fetch(url)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(data => {
                    setLikes(data[0].likes);
                })
            } else {
                throw Error('error')
            }
        })

    }
    function DisLikes() {
        const url = `http://localhost:3777/api/dislike/${id}/${ownerID}`
        fetch(url)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(data => {
                    setDislikes(data[0].dislikes)
                })
            } else {
                throw Error('error')
            }
        })
    }
    function Subscribe() {
        const url = `http://localhost:3777/api/subscribe/${ownerID}/${usvidid}`
        fetch(url)
        .then(response => {
            if(response.ok) {
                response.json()
                .then(data => {
                    console.log(data[0].follow)
                })
            } else {
                throw Error('error')
            }
        })
    }
    return (
        <>
        <div className='buttons_under__video'>
            <a href='/profile'><img className='user__wrapper-image' src="/src/assets/user.jpg" alt="" /></a>
            <button onClick={() => Subscribe()}>Subscribe</button>
            <button className='button_like' onClick={() => Likes()}><ThumbUpOffAltIcon/><span>{likes}</span></button>
            <button className='button_dislike' onClick={() => DisLikes()}><ThumbDownOffAltIcon/>{dislikes}</button>
            <button className='global_button_under_video'><ShareIcon/><span>Поделиться</span></button>
            <button className='global_button_under_video'><DownloadIcon/><span>Скачать</span></button>
            <button className='global_button_under_video'><ContentCutIcon/><span>Создать клип</span></button>
        </div>
        <div className={`description__wrapper ${isExpansion ? 'expanded' : 'collapsed'}`} onClick={toggleDescription}>
            <div className="description__wrapper-header">
            <span className='description__header-views'>1 439 319 просмотров</span>
            <span className='description__header-date'>5 июн. 2025 г.</span>
            </div>
            <div className='description__wrapper-content'>
            <p className='description__content-text'>
                {isExpansion 
                ? description
                : description.slice(0, 100) + "..."}
                <span className="description__toggle-btn">
                {isExpansion ? ' Свернуть' : 'еще'}
                </span>
            </p>
            </div>
        </div>
        </>
    )
}

export default Description;