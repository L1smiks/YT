import { useState } from 'react';
import './Search.scss'
import SearchIcon from '@mui/icons-material/Search';

function Search() {
    const [input,setInput] = useState("")
    return (
    <div className='search__wrapper'>
        <input onChange={(e) => setInput(e.target.value)} value = {input} placeholder='Введите название видео' type="Поиск" className='search__input'/>
        <button onClick= {() => {location.href = `/searchpage?q=${encodeURIComponent(input)}`}} className='search__button'><SearchIcon></SearchIcon></button>
    </div>
    )
}

export default Search;