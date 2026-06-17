import { cn, getStatusText, getStatusClass } from '../../utils';

interface StatusBadgeProps {
  status: string;
  text?: string;
  className?: string;
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', getStatusClass(status), className)}>
      {text || getStatusText(status)}
    </span>
  );
}
