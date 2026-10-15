import { Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import UploadForm from '../../Components/UploadForm/UploadForm.tsx';
import EmptyState from '../../Components/EmptyState/EmptyState.tsx';
import { useCurrentUser } from '../../store/userStore.ts';
import { useUiStore } from '../../store/uiStore.ts';
import './Studio.scss';

function Studio() {
    const user = useCurrentUser();
    const openAuth = useUiStore((s) => s.openAuth);

    if (!user) {
        return (
            <EmptyState
                icon={<LockOutlinedIcon />}
                title="Войдите, чтобы загружать видео"
                description="Студия доступна только авторизованным пользователям."
                action={<Button variant="contained" onClick={() => openAuth('login')}>Войти</Button>}
            />
        );
    }

    return (
        <div className="studio">
            <header className="studio__header">
                <h1>Загрузка видео</h1>
                <p>Заполните информацию о ролике и опубликуйте его на канале.</p>
            </header>
            <div className="studio__card">
                <UploadForm user={user} />
            </div>
        </div>
    );
}

export default Studio;
