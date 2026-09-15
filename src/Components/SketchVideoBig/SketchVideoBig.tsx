import './SketchVideoBig.scss'

type Videosprops = {
    id:string;
    title:string;
    thumbnail:string;
    description:string;
}

function SketchVideoBig(props:Videosprops) {
    console.log(props);
    return (
        <a href={`video?id=${props.id}`} className='videos__wrapper'>
            <img className='videos__image' src={props.thumbnail} alt="Dog"/>
            <div className='videos__down'>
                <img className='videos__image-number-one' src="/src/assets/avatar1.jpg" alt="" />
                <div className='videos__down-text'>
                    <div className='videos__text'>{props.title}</div>
                </div>
            </div>
        </a>
    )
}
//<a href='/video'><img className='videos__image' src={props.image} alt="Dog"/></a>
export default SketchVideoBig;