import type { ReactNode } from 'react';
import './EmptyState.scss';

type EmptyStateProps = {
    icon: ReactNode;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
};

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="empty-state__icon">{icon}</div>
            <h2 className="empty-state__title">{title}</h2>
            {description && <p className="empty-state__description">{description}</p>}
            {action && <div className="empty-state__action">{action}</div>}
        </div>
    );
}

export default EmptyState;
