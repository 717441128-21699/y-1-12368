import { ArrowUp, ArrowDown, Minus, Award } from 'lucide-react';
import { cn } from '../../../utils';
import type { HealthRankItem } from '../../../types';

interface HealthRankListProps {
  data: HealthRankItem[];
  onItemClick?: (item: HealthRankItem) => void;
}

export function HealthRankList({ data, onItemClick }: HealthRankListProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    return 'bg-gray-100 text-gray-600';
  };

  const getProgressColor = (index: number) => {
    if (index < 3) return 'bg-gradient-to-r from-success-400 to-success-600';
    if (index < 8) return 'bg-gradient-to-r from-primary-400 to-primary-600';
    if (index < 12) return 'bg-gradient-to-r from-warning-400 to-warning-600';
    return 'bg-gradient-to-r from-danger-400 to-danger-600';
  };

  return (
    <div className="space-y-3">
      {data.slice(0, 10).map((item, index) => (
        <div
          key={item.rank}
          onClick={() => onItemClick?.(item)}
          className={cn(
            'flex items-center gap-4 p-3 rounded-lg transition-all duration-200',
            'hover:bg-gray-50 cursor-pointer group',
            index < 3 && 'bg-gradient-to-r from-yellow-50/50 to-transparent'
          )}
        >
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
            getRankStyle(item.rank)
          )}>
            {index < 3 ? (
              <Award size={16} />
            ) : (
              item.rank
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-medium text-gray-800 text-sm truncate">{item.areaName}</p>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <span className="text-lg font-bold text-primary-700">{item.healthIndex.toFixed(1)}</span>
                {item.change > 0 ? (
                  <ArrowUp size={14} className="text-success-600" />
                ) : item.change < 0 ? (
                  <ArrowDown size={14} className="text-danger-600" />
                ) : (
                  <Minus size={14} className="text-gray-400" />
                )}
                <span className={cn(
                  'text-xs',
                  item.change > 0 ? 'text-success-600' : item.change < 0 ? 'text-danger-600' : 'text-gray-400'
                )}>
                  {Math.abs(item.change).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">{item.province}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getProgressColor(index))}
                  style={{ width: `${item.healthIndex}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
