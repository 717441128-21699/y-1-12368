import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { registerMap } from 'echarts/core';
import chinaGeoJson from './china.json';

registerMap('china', chinaGeoJson as any);

interface ProvinceHeatmapProps {
  data: { name: string; value: number }[];
  onProvinceClick?: (provinceName: string) => void;
  height?: number;
}

export function ProvinceHeatmap({ data, onProvinceClick, height = 500 }: ProvinceHeatmapProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const option = useMemo<EChartsOption>(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(30, 58, 95, 0.95)',
      borderColor: 'rgba(30, 58, 95, 0.8)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: (params: any) => {
        if (!params.data) return params.name;
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div>今日采砂量: <span style="font-weight: 600;">${params.data.value.toFixed(2)}</span> 万吨</div>
        `;
      },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      textStyle: { color: '#4a5568' },
      calculable: true,
      inRange: {
        color: ['#e6f4ea', '#a8e6cf', '#56ab91', '#1e88e5', '#1565c0', '#0d47a1', '#1a237e'],
      },
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      center: [105, 36],
      label: {
        show: true,
        color: '#2d3748',
        fontSize: 10,
      },
      emphasis: {
        label: {
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
        },
        itemStyle: {
          areaColor: '#1e3a5f',
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 15,
        },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        areaColor: '#f7fafc',
      },
      select: {
        label: { color: '#fff' },
        itemStyle: { areaColor: '#1e3a5f' },
      },
    },
    series: [
      {
        name: '采砂量',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        data: data.map(d => ({ name: d.name, value: d.value })),
      },
    ],
  }), [data, maxValue]);

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      if (params.name && onProvinceClick) {
        onProvinceClick(params.name);
      }
    },
  }), [onProvinceClick]);

  return (
    <ReactECharts
      option={option}
      onEvents={onEvents}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
