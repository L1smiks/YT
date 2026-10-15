import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, LinearProgress, MenuItem, TextField } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { errorMessage, uploadVideo } from '../../api/client.ts';
import { CATEGORIES } from '../../config.ts';
import type { User } from '../../types.ts';
import './UploadForm.scss';

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 5000;

function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} МБ`;
    return `${(bytes / 1024 ** 3).toFixed(2)} ГБ`;
}

function UploadForm({ user }: { user: User }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [video, setVideo] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [touched, setTouched] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadedId, setUploadedId] = useState<string | null>(null);

    useEffect(() => {
        if (!thumbnail) {
            setThumbPreview(null);
            return;
        }
        const url = URL.createObjectURL(thumbnail);
        setThumbPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [thumbnail]);

    const uploading = progress !== null;
    const errors = {
        title: touched && !title.trim() ? 'Введите название' : undefined,
        category: touched && !category ? 'Выберите категорию' : undefined,
        video: touched && !video ? 'Выберите видеофайл' : undefined,
        thumbnail: touched && !thumbnail ? 'Добавьте обложку' : undefined,
    };

    function pickVideo(file: File | undefined) {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError('Этот файл не похож на видео');
            return;
        }
        setError(null);
        setVideo(file);
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').slice(0, TITLE_MAX));
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        setDragging(false);
        pickVideo(e.dataTransfer.files[0]);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setTouched(true);
        if (!title.trim() || !category || !video || !thumbnail) return;

        setError(null);
        setProgress(0);
        try {
            const result = await uploadVideo(
                { title: title.trim(), description: description.trim(), category, ownerId: user.id, video, thumbnail },
                setProgress,
            );
            setUploadedId(String(result.video));
        } catch (err) {
            setError(errorMessage(err, 'Не удалось загрузить видео'));
        } finally {
            setProgress(null);
        }
    }

    function resetForm() {
        setTitle('');
        setDescription('');
        setCategory('');
        setVideo(null);
        setThumbnail(null);
        setTouched(false);
        setUploadedId(null);
    }

    if (uploadedId) {
        return (
            <div className="upload upload--done">
                <CheckCircleOutlineIcon className="upload__done-icon" />
                <h2>Видео опубликовано</h2>
                <p>Теперь его могут посмотреть все зрители.</p>
                <div className="upload__done-actions">
                    <Button variant="contained" component={Link} to={`/video?id=${uploadedId}`}>
                        Смотреть
                    </Button>
                    <Button variant="outlined" onClick={resetForm}>
                        Загрузить ещё
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form className="upload" onSubmit={handleSubmit} noValidate>
            <div className="upload__fields">
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label="Название"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                    error={Boolean(errors.title)}
                    helperText={errors.title ?? `${title.length}/${TITLE_MAX}`}
                    disabled={uploading}
                    fullWidth
                />
                <TextField
                    label="Описание"
                    placeholder="Расскажите зрителям о видео"
                    multiline
                    minRows={5}
                    maxRows={14}
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
                    helperText={`${description.length}/${DESCRIPTION_MAX}`}
                    disabled={uploading}
                    fullWidth
                />
                <TextField
                    select
                    label="Категория"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    error={Boolean(errors.category)}
                    helperText={errors.category}
                    disabled={uploading}
                    fullWidth
                >
                    {CATEGORIES.map((c) => (
                        <MenuItem key={c.value} value={c.value}>
                            {c.title}
                        </MenuItem>
                    ))}
                </TextField>

                <div>
                    <div className="upload__label">Обложка</div>
                    <p className="upload__hint">Выберите изображение, которое привлечёт внимание зрителей.</p>
                    <label className={`upload__thumb${errors.thumbnail ? ' upload__thumb--error' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            className="visually-hidden"
                            disabled={uploading}
                            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                        />
                        {thumbPreview ? (
                            <img src={thumbPreview} alt="Предпросмотр обложки" />
                        ) : (
                            <>
                                <AddPhotoAlternateOutlinedIcon />
                                <span>Загрузить обложку</span>
                            </>
                        )}
                    </label>
                    {errors.thumbnail && <p className="upload__error">{errors.thumbnail}</p>}
                </div>
            </div>

            <div className="upload__side">
                <label
                    className={`upload__drop${dragging ? ' upload__drop--active' : ''}${errors.video ? ' upload__drop--error' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="video/*"
                        className="visually-hidden"
                        disabled={uploading}
                        onChange={(e) => pickVideo(e.target.files?.[0])}
                    />
                    {video ? (
                        <>
                            <MovieOutlinedIcon className="upload__drop-icon" />
                            <strong className="upload__file-name">{video.name}</strong>
                            <span className="upload__hint">{formatSize(video.size)} · нажмите, чтобы заменить</span>
                        </>
                    ) : (
                        <>
                            <span className="upload__drop-circle">
                                <CloudUploadOutlinedIcon />
                            </span>
                            <strong>Перетащите видеофайл сюда</strong>
                            <span className="upload__hint">или нажмите, чтобы выбрать на компьютере</span>
                        </>
                    )}
                </label>
                {errors.video && <p className="upload__error">{errors.video}</p>}

            </div>

            <div className="upload__footer">
                {uploading && (
                    <div className="upload__progress">
                        <div className="upload__progress-label">
                            <span>Загрузка…</span>
                            <span>{progress}%</span>
                        </div>
                        <LinearProgress variant="determinate" value={progress ?? 0} />
                    </div>
                )}

                <Button type="submit" variant="contained" size="large" disabled={uploading} className="upload__submit">
                    {uploading ? 'Загрузка…' : 'Опубликовать'}
                </Button>
            </div>
        </form>
    );
}

export default UploadForm;
