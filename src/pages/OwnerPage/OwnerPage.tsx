import SideBar from '../../Components/SideBar/SideBar.tsx'
import WorkSpace from '../../Components/WorkSpace/WorkSpace.tsx';
import Header from '../../Components/Header/Header.tsx';
import Model from '../../Components/Model/Model.tsx'
import { useEffect, useState } from 'react';
import './OwnerPage.scss'
import type { Category } from '@mui/icons-material';


function OwnerPage() {
  const [body,setBody] = useState<File | null>(null);
  const [category, setCategory] = useState("")
  useEffect (() => {
    console.log(category)
  }, [category])
  /*useEffect(() => {
    const url = `http://localhost:3777/api/listvideo?limit=5`;
    fetch(url)
    .then(response => {
      if (response.ok) {
          response.json()
          .then(data => {
            console.log(data);
          })
      } else {
          throw Error('error')
      }
    })
  }, [])*/

  return (
    <div className="ownerpage__wrapper">
      <Header category = {category} setCategory={setCategory}/>
      <Model/>
      <div className='ownerpage__wrapper-wrap'>
        <SideBar/>
        <WorkSpace category = {category}/>
      </div>
    </div>
  )
}

export default OwnerPage;