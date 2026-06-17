import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn, formatNumber, formatPercent } from '../../utils';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: number;
  gradient?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  icon?: React.ReactNode;
  isPercent?: boolean;
}

export function MetricCard({ title, value, unit = '', trend, gradient = 'blue', icon, isPercent }: MetricCardProps) {
  const gradientClass = {
    blue: 'gradient-card-blue',
    green: 'gradient-card-green',
    orange: 'gradient-card-orange',
    red: 'gradient-card-red',
    purple: 'gradient-card-purple',
  }[gradient];

  return (
    <div className={cn('card p-5', gradientClass, 'card-hover')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold number-animate">
            {isPercent ? formatPercent(value, 1) : formatNumber(value, 2)}
            {!isPercent && unit && <span className="text-lg ml-1 font-medium">{unit}</span>}
          </p>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              trend >= 0 ? 'text-white' : 'text-warning-200'
            )}>
              {trend >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(trend).toFixed(1)}% 较上周</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-white/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
