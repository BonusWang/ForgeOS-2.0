import { useMemo } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import type { MoodEntry } from '../types';

/**
 * 计算近 N 天的情绪趋势数据
 * 返回按日期排序的数组，缺失日期用 null 填充
 */
export function useMoodTrend(
  moods: MoodEntry[],
  endDate: string,
  days: number = 7
): { date: string; mood: number | null; energy: number | null }[] {
  return useMemo(() => {
    const end = parseISO(endDate);
    const result: { date: string; mood: number | null; energy: number | null }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dateStr = format(addDays(end, -i), 'yyyy-MM-dd');
      const entry = moods.find((m) => m.date === dateStr);
      result.push({
        date: dateStr,
        mood: entry ? entry.mood : null,
        energy: entry ? entry.energy : null,
      });
    }

    return result;
  }, [moods, endDate, days]);
}

/**
 * 用 ASCII 字符绘制简单的折线图
 * 高度为 5 行，宽度为数据点数
 */
export function renderAsciiLineChart(
  data: (number | null)[],
  min: number = 1,
  max: number = 10
): string {
  if (data.every((v) => v === null)) return '暂无数据';

  const height = 5;
  const rows: string[] = [];

  for (let row = height; row > 0; row--) {
    const threshold = min + ((max - min) * (row - 1)) / height;
    const nextThreshold = min + ((max - min) * row) / height;
    let line = '';

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (val === null) {
        line += ' ';
        continue;
      }

      // 找到前一个和后一个非 null 值，用于绘制连接线
      let prevVal: number | null = null;
      let nextVal: number | null = null;
      for (let j = i - 1; j >= 0; j--) {
        if (data[j] !== null) { prevVal = data[j]; break; }
      }
      for (let j = i + 1; j < data.length; j++) {
        if (data[j] !== null) { nextVal = data[j]; break; }
      }

      const isPoint = val >= threshold && val < nextThreshold;
      const isRising = prevVal !== null && val > prevVal && val >= threshold && prevVal < nextThreshold;
      const isFalling = prevVal !== null && val < prevVal && val >= threshold && prevVal >= nextThreshold;

      if (isPoint) {
        line += '●';
      } else if (isRising || isFalling) {
        line += '│';
      } else if (prevVal !== null && nextVal !== null) {
        // 检查是否需要在当前行绘制水平或斜线连接
        const avg = (prevVal + nextVal) / 2;
        if (avg >= threshold && avg < nextThreshold) {
          line += '─';
        } else {
          line += ' ';
        }
      } else {
        line += ' ';
      }
    }

    rows.push(line);
  }

  return rows.join('\n');
}
