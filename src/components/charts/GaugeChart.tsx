import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface GaugeChartProps {
  value: number;
  title: string;
  max?: number;
  unit?: string;
  height?: number;
}

export function GaugeChart({ value, title, max = 100, unit = '', height = 200 }: GaugeChartProps) {
  const getColor = (val: number) => {
    if (val >= 90) return '#38a169';
    if (val >= 75) return '#3182ce';
    if (val >= 60) return '#dd6b20';
    return '#e53e3e';
  };

  const option: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max,
        splitNumber: 10,
        radius: '90%',
        center: ['50%', '60%'],
        itemStyle: {
          color: getColor(value),
        },
        progress: {
          show: true,
          width: 12,
          roundCap: true,
        },
        pointer: {
          show: true,
          width: 4,
          length: '60%',
          itemStyle: { color: '#4a5568' },
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, '#edf2f7']],
          },
          roundCap: true,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        anchor: {
          show: true,
          size: 10,
          itemStyle: { color: '#4a5568' },
        },
        title: {
          show: true,
          offsetCenter: [0, '80%'],
          fontSize: 13,
          fontWeight: 500,
          color: '#718096',
        },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '20%'],
          formatter: `{value}${unit}`,
          color: getColor(value),
        },
        data: [
          {
            value: Math.round(value * 10) / 10,
            name: title,
          },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} />;
}
