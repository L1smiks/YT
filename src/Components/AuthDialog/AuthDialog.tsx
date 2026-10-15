import { useEffect, useState, type FormEvent } from 'react';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    InputAdornment,
    Tab,
    Tabs,
    TextField,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useUiStore, type AuthMode } from '../../store/uiStore.ts';
import { useUserStore } from '../../store/userStore.ts';
import { errorMessage, login, register } from '../../api/client.ts';
import { APP_NAME } from '../../config.ts';
import './AuthDialog.scss';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
    username: string;
    password: string;
    confirm: string;
    email: string;
}

const EMPTY: FormState = { username: '', password: '', confirm: '', email: '' };

function validate(mode: AuthMode, f: FormState): Partial<Record<keyof FormState, string>> {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!f.username.trim()) errors.username = 'Введите логин';
    if (!f.password) errors.password = 'Введите пароль';
    if (mode === 'register') {
        if (f.username.trim() && f.username.trim().length < 3) errors.username = 'Минимум 3 символа';
        if (f.password && f.password.length < 6) errors.password = 'Минимум 6 символов';
        if (f.confirm !== f.password) errors.confirm = 'Пароли не совпадают';
        if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Введите корректный email';
    }
    return errors;
}

function AuthDialog() {
    const mode = useUiStore((s) => s.authMode);
    const openAuth = useUiStore((s) => s.openAuth);
    const closeAuth = useUiStore((s) => s.closeAuth);
    const showToast = useUiStore((s) => s.showToast);
    const setUser = useUserStore((s) => s.setUser);
    const fullScreen = !useMediaQuery('(min-width:600px)');

    const [form, setForm] = useState<FormState>(EMPTY);
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        if (mode) {
            setTouched(false);
            setServerError(null);
        } else {
            setForm(EMPTY);
            setShowPassword(false);
        }
    }, [mode]);

    if (!mode) return null;

    const errors = touched ? validate(mode, form) : {};
    const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!mode) return;
        setTouched(true);
        if (Object.keys(validate(mode, form)).length > 0) return;

        setSubmitting(true);
        setServerError(null);
        try {
            const username = form.username.trim();
            if (mode === 'register') {
                await register(username, form.password, form.email.trim());
            }
            const user = await login(username, form.password);
            setUser(user);
            closeAuth();
            showToast(mode === 'register' ? `Добро пожаловать, ${user.username}!` : `Вы вошли как ${user.username}`);
        } catch (err) {
            setServerError(errorMessage(err, mode === 'register' ? 'Не удалось зарегистрироваться' : 'Не удалось войти'));
        } finally {
            setSubmitting(false);
        }
    }

    const passwordAdornment = (
        <InputAdornment position="end">
            <IconButton
                edge="end"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPassword((v) => !v)}
            >
                {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
            </IconButton>
        </InputAdornment>
    );

    return (
        <Dialog open onClose={closeAuth} fullScreen={fullScreen} maxWidth="xs" fullWidth>
            <IconButton aria-label="Закрыть" onClick={closeAuth} className="auth__close">
                <CloseIcon />
            </IconButton>
            <DialogContent className="auth">
                <div className="auth__header">
                    <img src="/logo.png" alt="" width={48} height={48} />
                    <h2 className="auth__title">{mode === 'login' ? 'Вход' : 'Создание аккаунта'}</h2>
                    <p className="auth__subtitle">
                        {mode === 'login' ? `Продолжите в ${APP_NAME}` : 'Делитесь видео и общайтесь с авторами'}
                    </p>
                </div>

                <Tabs
                    value={mode}
                    onChange={(_, v: AuthMode) => openAuth(v)}
                    variant="fullWidth"
                    className="auth__tabs"
                >
                    <Tab value="login" label="Вход" />
                    <Tab value="register" label="Регистрация" />
                </Tabs>

                <form className="auth__form" onSubmit={handleSubmit} noValidate>
                    {serverError && <Alert severity="error">{serverError}</Alert>}
                    <TextField
                        label="Логин"
                        autoComplete="username"
                        autoFocus
                        value={form.username}
                        onChange={update('username')}
                        error={Boolean(errors.username)}
                        helperText={errors.username}
                        fullWidth
                    />
                    {mode === 'register' && (
                        <TextField
                            label="Email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={update('email')}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                            fullWidth
                        />
                    )}
                    <TextField
                        label="Пароль"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        value={form.password}
                        onChange={update('password')}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        slotProps={{ input: { endAdornment: passwordAdornment } }}
                        fullWidth
                    />
                    {mode === 'register' && (
                        <TextField
                            label="Повторите пароль"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={form.confirm}
                            onChange={update('confirm')}
                            error={Boolean(errors.confirm)}
                            helperText={errors.confirm}
                            fullWidth
                        />
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        className="auth__submit"
                        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
                    >
                        {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AuthDialog;
