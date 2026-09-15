import './Header.scss'
import Search from '../../Components/Search/Search.tsx';
import Model from '../../Components/Model/Model.tsx'
import Category from '../Category/Category.tsx';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useUserStore } from '../../store/storeZustand.tsx'

type functionCategory = {
    category?: string;
    setCategory?: (value: string) => void; 
}

function Header(props: functionCategory) {
    const [isVisible,setVisible] = useState(false);
    const [isVisiblee,setVisiblee] = useState(false);
    const [login,setLogin] = useState("");
    const [password,setPassword] = useState("");
    const [approvePassword,setApprovePassword] = useState("");
    const [email,setEmail] = useState("");
    const [nothing,setNice] = useState(false);
    const setUserId = useUserStore((state) => state.setUserId);
    const setIsLoggedIn = useUserStore((state) => state.setIsLoggedIn);
    const setUserName = useUserStore((state) => state.setUserName);

    async function Registpage() {
        const url = `http://localhost:3777/regist?limit=12&offset=0`;
        const payload = {login:login,password:password,email:email};
        const body = JSON.stringify(payload);
        const init = {method: 'POST', headers:{"Content-Type":"application/json"},body:body};

        fetch(url,init)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(data => location.href = `/main`)
            } else {
                throw Error('error')
            }
        
        })
    }
    async function Loginpage() {
        const url = `http://localhost:3777/login?limit=12&offset=0`;
        const payload = {login:login,password:password};
        const body = JSON.stringify(payload);
        const init = {method: 'POST', headers:{"Content-Type":"application/json"},body:body};

        return fetch(url,init)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(data => {
                    const userID: string = data.user.id;
                    const userName: string = data.user.username;
                    setUserId(userID);
                    setUserName(userName);
                    setIsLoggedIn(true);
                    return [userID,userName];
                })
            } else {
                throw Error('error')
            }
        })
    }
    const style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        py: 8,
        px:4,
    };
    const Visible = () => setVisible(true);
    const unVisible = () => setVisible(false);
    const Visibleea = () => setVisiblee(true);
    const unVisiblea = () => setVisiblee(false);
    return (
        <>
        <div className='header__wrapper'>
            <div className='header__wrapper-content'>
                <a href='/' className='sidebar__wrapper-image'><img className="sidebar__image" src="/src/assets/Logo.png" alt="Kot" /></a>
                <Search/>
                <div className='user__wrapper'>
                    <Button variant="contained" className='user__wrapper-download' href='/downloadvideo' sx={{marginRight: '20px'}}>Create</Button>
                    <a href='/profile'><img className='user__wrapper-image' src="/src/assets/user.jpg" alt="" /></a>
                    <Button variant="contained" className='user__wrapper-login' onClick={Visible} sx={{marginRight: '20px'}}>Login</Button>
                    <Button variant="contained" className='user__wrapper-registration' onClick={Visibleea} sx={{marginRight: '20px'}}>Registration</Button>   
                </div>
            </div>
            <div className='category__wrap'>
                <div className='category__parent'>
                    <Category category = {props.category} setCategory={props.setCategory} title = 'Все' value = "All"/>
                    <Category category = {props.category} setCategory={props.setCategory} title= 'Видеоигры' value = "Videogames"/>
                    <Category category = {props.category} setCategory={props.setCategory} title= 'Юмор' value = "Humor"/>
                    <Category category = {props.category} setCategory={props.setCategory} title= 'Наука' value = "Scienty"/>
                    <Category category = {props.category} setCategory={props.setCategory} title= 'Фильмы' value = "Films"/>
                    <Category category = {props.category} setCategory={props.setCategory} title= 'Музыка' value = "Music"/>
                </div>
            </div>
            {<Modal
            open={isVisible}
            onClose={unVisible}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h1 className='headding__wrapper' style={{marginBottom: '24px'}}>Login</h1>
                    <Box sx={{width:'100%',justifyContent: 'center',display:'flex',flexDirection:'row',alignItems:'center',gap:2}}>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3,flexGrow: 0,marginBottom:'45px'}}>
                            <TextField
                            className="modal__input-login"
                            required
                            label="Login"
                            variant="standard"
                            onChange={(e) => setLogin(e.target.value)}
                            sx={{width:300}}
                            />
                            <TextField
                            className="modal__input-password"
                            required
                            label="Password"
                            variant="standard"
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{width:300}}
                            />
                        </Box>
                        <Button className='modal__wrapper-login' variant="contained" onClick={() => Loginpage()} sx={{ml:10,width:100}}>Login</Button>
                    </Box>
                </Box>
            </Modal>}
            {<Modal
            open={isVisiblee}
            onClose={unVisiblea}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h1>Registration</h1>
                    <Box sx={{width:'100%',justifyContent: 'center',display:'flex',flexDirection:'row',alignItems:'center'}}>
                        <Box sx={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                            <TextField
                            className="modal__input-login"
                            required
                            label="Login"
                            variant="standard"
                            onChange={(e) => setLogin(e.target.value)}
                            />
                            <TextField
                            className="modal__input-password"
                            required
                            label="Password"
                            variant="standard"
                            onChange={(e) => setPassword(e.target.value)}
                            />
                            <TextField
                            className="modal__input-password-approve"
                            required
                            label="Aprove Password"
                            variant="standard"
                            onChange={(e) => setApprovePassword(e.target.value)}
                            />
                            {nothing && (<p>Пароли не совпадают</p>)}
                            <TextField
                            className="modal__input-email"
                            required
                            label="Email"
                            variant="standard"
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </Box>
                        <Button className='modal__wrapper-login' variant="contained" onClick={() => {Registpage(); password == approvePassword?setNice(false):setNice(true)}} sx={{width:250,mr:3}}>Registration</Button>
                    </Box>
                </Box>
            </Modal>}
        </div>
        </>
    )
}

export default Header;