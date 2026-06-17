import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  data?: { name: string; value: number }[];
  xData?: string[];
  yData?: number[];
  title?: string;
  xAxisName?: string;
  yAxisName?: string;
  color?: string;
  height?: number;
}

export function BarChart({
  data,
  xData,
  yData,
  title,
  xAxisName,
  yAxisName,
  color = '#1e3a5f',
  height = 300,
}: BarChartProps) {
  let chartXData: string[] = [];
  let chartYData: number[] = [];

  if (data && data.length > 0) {
    chartXData = data.map(d => d.name);
    chartYData = data.map(d => d.value);
  } else {
    chartXData = xData || [];
    chartYData = yData || [];
  }

  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#2d3748',
      },
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: title ? '15%' : '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartXData,
      name: xAxisName,
      nameTextStyle: { color: '#718096', fontSize: 11 },
      axisLine: { lineStyle: { color: '#cbd5e0' } },
      axisLabel: { color: '#718096', fontSize: 11, interval: 0, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: { color: '#718096', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#718096', fontSize: 11 },
      splitLine: { lineStyle: { color: '#edf2f7', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar' as const,
        barWidth: '50%',
        data: chartYData.map((value, index) => ({
          value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: color },
                { offset: 1, color: color + '80' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} />;
}
