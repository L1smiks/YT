import { CATEGORIES } from '../../config.ts';
import './CategoryBar.scss';

type CategoryBarProps = {
    value: string | null;
    onChange: (value: string | null) => void;
};

const OPTIONS = [{ value: null, title: 'Все' }, ...CATEGORIES];

/** Horizontally scrollable chips for filtering the feed by category. */
function CategoryBar({ value, onChange }: CategoryBarProps) {
    return (
        <div className="category-bar" role="tablist" aria-label="Категории">
            {OPTIONS.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value ?? 'all'}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={`category-bar__chip${active ? ' category-bar__chip--active' : ''}`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.title}
                    </button>
                );
            })}
        </div>
    );
}

export default CategoryBar;
