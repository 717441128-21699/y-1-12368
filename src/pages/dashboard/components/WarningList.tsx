import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatDate, getRelativeTime, getWarningLevelText } from '../../../utils';
import { StatusBadge } from '../../../components/common/StatusBadge';
import type { Warning } from '../../../types';

interface WarningListProps {
  data: Warning[];
}

export function WarningList({ data }: WarningListProps) {
  const navigate = useNavigate();

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'border-l-danger-500 bg-danger-50/50';
      case 2: return 'border-l-warning-500 bg-warning-50/50';
      default: return 'border-l-primary-500 bg-primary-50/50';
    }
  };

  const getLevelBgColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-danger-500';
      case 2: return 'bg-warning-500';
      default: return 'bg-primary-500';
    }
  };

  return (
    <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin pr-2">
      {data.slice(0, 8).map((warning) => (
        <div
          key={warning.id}
          onClick={() => navigate(`/warning/${warning.id}`)}
          className={cn(
            'border-l-4 rounded-r-lg p-4 cursor-pointer transition-all duration-200',
            'hover:shadow-md hover:translate-x-1',
            getLevelColor(warning.level)
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn(
                'p-2 rounded-lg flex-shrink-0',
                warning.level === 1 && 'animate-breathing'
              )}
              style={{ backgroundColor: warning.level === 1 ? 'rgba(229, 62, 62, 0.1)' : undefined }}
              >
                <AlertTriangle
                  size={20}
                  className={warning.level === 1 ? 'text-danger-600' : warning.level === 2 ? 'text-warning-600' : 'text-primary-600'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-semibold text-white',
                    getLevelBgColor(warning.level)
                  )}>
                    {getWarningLevelText(warning.level)}
                  </span>
                  <StatusBadge status={warning.status} />
                  <span className="text-xs text-gray-500">{warning.typeName}</span>
                </div>
                <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">
                  {warning.areaName}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">{warning.description}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-2 group-hover:text-primary-600 transition-colors" />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {getRelativeTime(warning.triggerTime)}
            </span>
            <span>{formatDate(warning.triggerTime, 'MM-DD HH:mm')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
