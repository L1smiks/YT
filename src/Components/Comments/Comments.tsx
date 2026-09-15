import { useState, useEffect } from 'react';
import './Comments.scss'
import { useUserStore } from '../../store/storeZustand.tsx'
import { useSearchParams } from 'react-router-dom';

interface Comment {
  content: string;
  author_name: string;
  id: string;
}

function Comments() {
    const [comment,setComment] = useState('');
    const [comments,setComments] = useState<Comment[]>([]);
    const userName = useUserStore((state) => state.userName);
    const ownerID = useUserStore((state) => state.userId);
    const [params] = useSearchParams();
    const id = params.get("id");
    useEffect(() => {
        const url = `http://localhost:3777/api/listcomments/${id}`;
        fetch(url)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(data => {
                    console.log(data);
                    setComments(data);
                })
        } else {
          throw Error('error')
        }})
    }, [])
    async function commentSubmit() {
        const url = `http://localhost:3777/api/comments/upload/${id}`;
        if (!userName) {
            return alert('Зайдите в ваш профиль!');
        }
        if (!id) {
            return alert('Видео не найдено');
        }
        setComments([{content: comment, author_name: userName, id: id}, ...comments]);
        const data = {
            content: comment,
            autor: ownerID,
            author_name: userName,
            video: id
        }
        await fetch(url,{
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
    }
    return (
        <>
        <div className='comments__wrapper'>
            <p>55555</p>
            <img className='comments__chanel' src="/src/assets/avatar1.jpg" alt="" />
            <input onChange={(e) => setComment(e.target.value)} value = {comment} type="text" name="" id="" />
            <button onClick={() => commentSubmit()}>Отправить</button>
        </div>
        <div>
            {comments.map((comment) => (
                <div key={comment['id']}>
                    <p>{comment['author_name']}</p>
                    <p>{comment['content']}</p>
                </div>
            ))}
        </div>
        </>
    )
}

export default Comments;