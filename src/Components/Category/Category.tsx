import { useState } from 'react';
import './Category.scss'

type CategoryProps = {
    title:string;
    value:string;
    category?:string;
    setCategory?: (value: string) => void;
}


function Category(props:CategoryProps) {
    return (
        <button className='category__button' onClick={() => {props.setCategory?.(props.value)}}>{props.title}</button>
    )
}

export default Category;