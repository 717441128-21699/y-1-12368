import ReactECharts from 'echarts-for-react';
import type { EChartsOption, SeriesOption } from 'echarts';

interface LineChartProps {
  data: any[];
  xField?: string;
  series?: { key: string; name: string; color?: string; dashed?: boolean; area?: boolean }[];
  title?: string;
  yAxisName?: string;
  height?: number;
  showLegend?: boolean;
}

export function LineChart({
  data,
  xField = 'date',
  series,
  title,
  yAxisName,
  height = 300,
  showLegend = false,
}: LineChartProps) {
  const defaultSeries = series || [
    { key: 'value', name: '实际值', color: '#1e3a5f', area: true },
    ...(data[0]?.target !== undefined ? [{ key: 'target', name: '目标值', color: '#dd6b20', dashed: true }] : []),
  ];

  const legendData = defaultSeries.map(s => s.name);

  const seriesConfig: SeriesOption[] = defaultSeries.map((s, index) => ({
    name: s.name,
    type: 'line' as const,
    smooth: true,
    symbol: s.dashed ? 'none' : 'circle',
    symbolSize: 6,
    data: data.map(d => d[s.key]),
    lineStyle: {
      color: s.color || (index === 0 ? '#1e3a5f' : '#dd6b20'),
      width: 2,
      type: s.dashed ? 'dashed' : 'solid',
    },
    itemStyle: { color: s.color || (index === 0 ? '#1e3a5f' : '#dd6b20') },
    areaStyle: s.area ? {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: `${s.color || '#1e3a5f'}33` },
          { offset: 1, color: `${s.color || '#1e3a5f'}05` },
        ],
      },
    } : undefined,
  }));

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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748' },
    },
    legend: showLegend || defaultSeries.length > 1 ? {
      data: legendData,
      bottom: 0,
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: (showLegend || defaultSeries.length > 1) ? '15%' : '5%',
      top: title ? '15%' : '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d[xField]),
      axisLine: { lineStyle: { color: '#cbd5e0' } },
      axisLabel: { color: '#718096', fontSize: 11 },
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
    series: seriesConfig,
  };

  return <ReactECharts option={option} style={{ height }} />;
}
