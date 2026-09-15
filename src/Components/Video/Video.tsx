import './Video.scss'
import { useSearchParams } from 'react-router-dom';


function Video() {
    const [params] = useSearchParams();
    const id = params.get("id");
    return (
        <div className='video__wrapper'>
            <video src={`http://localhost:3777/api/video/${id}`} id='video' controls className='video__image'>
                Ошибка загрузки
            </video>
        </div>
    )
}

export default Video;