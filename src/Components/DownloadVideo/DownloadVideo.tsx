import './DownloadVideo.scss'
import Header from '../../Components/Header/Header.tsx'
import SideBar from '../../Components/SideBar/SideBar.tsx'
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import TextField from '@mui/material/TextField'
import { useUserStore } from '../../store/storeZustand.tsx'


const DownloadVideo: React.FC = () =>  {
    const [isVisible,setVisible] = useState(false);
    const [name,setName] = useState("");
    const [description,setDescription] = useState("");
    const [file,setFile] = useState<File | null>(null);
    const userID = useUserStore((state) => state.userId);
    const [thumbnail,setThumbnail] = useState<File | null>(null);
    const [category,setCategory] = useState("");
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
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }
    function handleFileTake(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setThumbnail(e.target.files[0]);
        }
    }
    async function handleSubmit() {
        if (!file) {
            return alert('Выберите видео');
        }
        if (!thumbnail) {
            return alert('Выберите картинку');
        }
        const url = `http://localhost:3777/api/videos/upload`;
        const formData = new FormData();
        formData.append('video',file);
        formData.append('name',name);
        formData.append('category',category);
        formData.append('description',description);
        if (userID) {
            formData.append('ownerid',userID);
        }
        formData.append('thumbnail',thumbnail);
        const res = await fetch(url,{method: 'POST', body: formData});
        const data = await res.json()
        console.log(data);
        if (res.ok) {
            setVisible(false);
            alert('Видео загружено');
        }
        else {
            console.error(data.error);
        }
    }
    return (
        <>
        <div className='downloadvideo__wrapper'>
            <Button className='downloadvideo__wrapper-create' variant="contained" onClick={Visible} sx={{ml:'50px',mt:'50px'}}>Create Video</Button>
        </div>
        {<Modal
            open={isVisible}
            onClose={unVisible}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h1 className='headding__wrapper' style={{marginBottom: '24px'}}>Загрузка видео</h1>
                    <Box sx={{width:'100%',justifyContent: 'center',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3,flexGrow: 0,marginBottom:'45px'}}>
                            <TextField
                                className="modal__input-name"
                                required
                                label="Название видео"
                                variant="standard"
                                onChange={(e) => setName(e.target.value)}
                                sx={{width:370}}
                            />
                            <TextField
                                className="modal__input-description"
                                required
                                label="Описание к видео"
                                variant="standard"
                                onChange={(e) => setDescription(e.target.value)}
                                sx={{width:370}}
                            />
                            <select onChange={(e) => setCategory(e.target.value)}>
                                <option value = "0" > Выберите категорию </option>
                                <option value = "Videogames"> Видеоигры </option>
                                <option value = "Films"> Фильмы </option>
                                <option value = "Music"> Музыка </option>
                                <option value = "Humor"> Юмор </option>
                                <option value = "Scienty" > Наука </option>
                            </select>
                            <Button variant="contained" component="label">
                                <p>Картинка</p>
                                <input hidden type="file" accept='image/*' onChange={handleFileTake}/>
                            </Button>
                            <Button variant="outlined" component="label">
                                <p>Видео</p>
                                <input hidden type="file" accept='video/*' onChange={handleFileChange}/>
                            </Button>
                            <p style={{ fontSize: '14px', color: '#606060', marginBottom:'-30px' }}>Нажмите кнопку ниже, чтобы загрузить файлы с компьютера.</p>
                        </Box>
                        <Button className='modal__wrapper-login' variant="contained" onClick={() => handleSubmit()} sx={{mr:'20px',padding:'20px 30px 20px 30px',backgroundColor:'black'}}><FileUploadIcon/></Button>
                    </Box>
                </Box>
            </Modal>}
        </>
    )
}

export default DownloadVideo;