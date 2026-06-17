import dayjs from 'dayjs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(decimals) + '万';
  }
  return num.toFixed(decimals);
}

export function formatPercent(num: number, decimals = 1): string {
  return num.toFixed(decimals) + '%';
}

export function formatDate(timestamp: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(timestamp).format(format);
}

export function formatDateStr(dateStr: string, format = 'YYYY-MM-DD'): string {
  return dayjs(dateStr).format(format);
}

export function getRelativeTime(timestamp: number): string {
  const now = dayjs();
  const diff = now.diff(dayjs(timestamp), 'minute');
  
  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  if (diff < 43200) return `${Math.floor(diff / 1440)}天前`;
  return formatDate(timestamp, 'YYYY-MM-DD');
}

export function calculateOverMiningRate(actualAmount: number, permittedAmount: number): number {
  if (permittedAmount <= 0) return 0;
  const rate = ((actualAmount - permittedAmount) / permittedAmount) * 100;
  return Math.max(0, Math.round(rate * 100) / 100);
}

export function calculateComplianceRate(records: { isCompliant: boolean }[]): number {
  if (records.length === 0) return 100;
  const compliantCount = records.filter(r => r.isCompliant).length;
  return Math.round((compliantCount / records.length) * 100 * 10) / 10;
}

export function calculateHealthIndex(params: {
  overMiningRate: number;
  waterFluctuation: number;
  siltationLevel: number;
  ecologicalScore: number;
}): number {
  const weights = {
    overMining: 0.35,
    waterLevelStability: 0.25,
    siltationStatus: 0.2,
    ecologicalImpact: 0.2,
  };

  const overMiningScore = Math.max(0, 100 - params.overMiningRate * 2);
  const waterLevelScore = Math.max(0, 100 - params.waterFluctuation * 50);
  const siltationScore = 100 - params.siltationLevel * 25;
  const ecologicalScore = params.ecologicalScore;

  const healthIndex =
    overMiningScore * weights.overMining +
    waterLevelScore * weights.waterLevelStability +
    siltationScore * weights.siltationStatus +
    ecologicalScore * weights.ecologicalImpact;

  return Math.round(healthIndex * 10) / 10;
}

export function getWarningLevelColor(level: number): string {
  switch (level) {
    case 1:
      return 'danger';
    case 2:
      return 'warning';
    case 3:
      return 'primary';
    default:
      return 'default';
  }
}

export function getWarningLevelText(level: number): string {
  switch (level) {
    case 1:
      return '一级预警';
    case 2:
      return '二级预警';
    case 3:
      return '三级预警';
    default:
      return '未知';
  }
}

export function getWarningTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    over_mining: '超采预警',
    water_level_drop: '水位异常',
    permit_exceed: '许可超限',
  };
  return typeMap[type] || type;
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    normal: '正常',
    warning: '预警中',
    suspended: '已停采',
    pending: '待处理',
    confirmed: '已确认',
    reviewed: '已复核',
    approved: '已批准',
    rejected: '已驳回',
    closed: '已关闭',
    valid: '有效',
    exceeded: '已超限',
    expired: '已过期',
    processing: '处理中',
    mining: '采砂中',
    transporting: '运输中',
    idle: '空闲',
  };
  return statusMap[status] || status;
}

export function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    normal: 'status-normal',
    warning: 'status-warning',
    suspended: 'status-danger',
    pending: 'status-warning',
    confirmed: 'status-normal',
    reviewed: 'status-normal',
    approved: 'status-normal',
    rejected: 'status-danger',
    closed: 'status-normal',
    valid: 'status-normal',
    exceeded: 'status-danger',
    expired: 'status-warning',
    processing: 'status-warning',
    mining: 'status-normal',
    transporting: 'status-warning',
    idle: 'status-normal',
  };
  return classMap[status] || '';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getRandomInRange(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
