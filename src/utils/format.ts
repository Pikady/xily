// 时间格式化工具函数

/**
 * 将分钟数转换为可读的时间格式
 * @param minutes 分钟数
 * @returns 格式化的时间字符串
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  } else {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    
    let result = `${days}天`;
    if (hours > 0) result += `${hours}小时`;
    if (mins > 0) result += `${mins}分钟`;
    
    return result;
  }
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 格式类型
 * @returns 格式化的日期字符串
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    case 'long':
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    case 'time':
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toLocaleDateString('zh-CN');
  }
}

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化数字
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化的数字字符串
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 计算两个日期之间的天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取日期范围描述
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期范围描述
 */
export function getDateRangeDescription(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = getDaysBetween(startDate, endDate);
  
  if (days === 0) {
    return formatDate(startDate, 'long');
  } else if (days === 1) {
    return `${formatDate(startDate, 'short')} - ${formatDate(endDate, 'short')} (2天)`;
  } else if (days <= 7) {
    return `${formatDate(startDate, 'short')} - ${formatDate(endDate, 'short')} (${days + 1}天)`;
  } else if (days <= 30) {
    const weeks = Math.ceil(days / 7);
    return `${formatDate(startDate, 'short')} - ${formatDate(endDate, 'short')} (${weeks}周)`;
  } else {
    const months = Math.ceil(days / 30);
    return `${formatDate(startDate, 'short')} - ${formatDate(endDate, 'short')} (${months}个月)`;
  }
}