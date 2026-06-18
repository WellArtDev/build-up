import { ReactNode } from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-outfit text-lg text-white mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary max-w-md mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
