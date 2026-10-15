import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import './Search.scss';

type SearchProps = {
    autoFocus?: boolean;
    onSubmitted?: () => void;
};

function Search({ autoFocus, onSubmitted }: SearchProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const currentQuery = location.pathname === '/searchpage' ? (params.get('q') ?? '') : '';
    const [input, setInput] = useState(currentQuery);

    // Keep the field in sync when the user navigates between result pages.
    useEffect(() => setInput(currentQuery), [currentQuery]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const query = input.trim();
        if (!query) return;
        navigate(`/searchpage?q=${encodeURIComponent(query)}`);
        onSubmitted?.();
    }

    return (
        <form className="search" role="search" onSubmit={handleSubmit}>
            <div className="search__field">
                <SearchIcon className="search__field-icon" fontSize="small" />
                <input
                    className="search__input"
                    type="search"
                    name="q"
                    placeholder="Поиск"
                    aria-label="Поиск видео"
                    autoComplete="off"
                    autoFocus={autoFocus}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                {input && (
                    <IconButton size="small" aria-label="Очистить" onClick={() => setInput('')}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </div>
            <Tooltip title="Искать">
                <button className="search__button" type="submit" aria-label="Искать">
                    <SearchIcon />
                </button>
            </Tooltip>
        </form>
    );
}

export default Search;
