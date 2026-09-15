import './Profile.scss'
import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/storeZustand.tsx'



function Profile() {
  const ownerID = useUserStore((state) => state.userId);
  const [followers, setFollowers] = useState(0);
  function Follow() {
    const url = `http://localhost:3777/api/subscribe/${ownerID}`
    fetch(url)
    .then (response => {
      if (response.ok) {
        response.json()
        .then (data => {
          setFollowers(data[0].followers)
        })
      } else {
        throw Error('error')
      }
    })
  }
  return (
    <div>
      <h1></h1>
      <button onClick={() => Follow()}>Subscribe</button>
    </div>
  )
}

export default Profile;