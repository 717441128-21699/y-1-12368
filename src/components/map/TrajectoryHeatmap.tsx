import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface TrajectoryHeatmapProps {
  data: [number, number, number][];
  center?: [number, number];
  boundary?: [number, number][];
  height?: number;
}

export function TrajectoryHeatmap({ data, center, boundary, height = 400 }: TrajectoryHeatmapProps) {
  const viewBounds = useMemo(() => {
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    const hasBoundary = boundary && boundary.length > 0;
    const hasData = data && data.length > 0;
    const hasCenter = !!center;

    const boundaryPoints: [number, number][] = hasBoundary 
      ? boundary 
      : hasCenter 
        ? [
            [center[0] - 0.05, center[1] - 0.05],
            [center[0] + 0.05, center[1] - 0.05],
            [center[0] + 0.05, center[1] + 0.05],
            [center[0] - 0.05, center[1] + 0.05],
          ]
        : [];

    if (boundaryPoints.length > 0) {
      const bLngs = boundaryPoints.map(p => p[0]);
      const bLats = boundaryPoints.map(p => p[1]);
      minLng = Math.min(minLng, ...bLngs);
      maxLng = Math.max(maxLng, ...bLngs);
      minLat = Math.min(minLat, ...bLats);
      maxLat = Math.max(maxLat, ...bLats);
    }

    if (hasData) {
      const lngs = data.map(d => d[0]);
      const lats = data.map(d => d[1]);
      minLng = Math.min(minLng, ...lngs);
      maxLng = Math.max(maxLng, ...lngs);
      minLat = Math.min(minLat, ...lats);
      maxLat = Math.max(maxLat, ...lats);
    }

    if (minLng === Infinity) {
      if (hasCenter) {
        minLng = center[0] - 0.1;
        maxLng = center[0] + 0.1;
        minLat = center[1] - 0.1;
        maxLat = center[1] + 0.1;
      } else {
        minLng = 73;
        maxLng = 135;
        minLat = 18;
        maxLat = 54;
      }
    }

    const lngPad = (maxLng - minLng) * 0.15 || 0.1;
    const latPad = (maxLat - minLat) * 0.15 || 0.1;

    return {
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
    };
  }, [data, center, boundary]);

  const option = useMemo<EChartsOption>(() => ({
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `作业密度: ${params.data[2]?.toFixed(0) || 0}`;
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      text: ['高密度', '低密度'],
      textStyle: { color: '#4a5568', fontSize: 11 },
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '15%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '经度',
      nameTextStyle: { color: '#718096', fontSize: 11 },
      axisLine: { lineStyle: { color: '#cbd5e0' } },
      axisLabel: { color: '#718096', fontSize: 10 },
      splitLine: { lineStyle: { color: '#edf2f7', type: 'dashed' } },
      min: viewBounds.minLng,
      max: viewBounds.maxLng,
      scale: true,
    },
    yAxis: {
      type: 'value',
      name: '纬度',
      nameTextStyle: { color: '#718096', fontSize: 11 },
      axisLine: { lineStyle: { color: '#cbd5e0' } },
      axisLabel: { color: '#718096', fontSize: 10 },
      splitLine: { lineStyle: { color: '#edf2f7', type: 'dashed' } },
      min: viewBounds.minLat,
      max: viewBounds.maxLat,
      scale: true,
    },
    series: [
      {
        name: '作业密度',
        type: 'heatmap',
        data: data,
        pointSize: 8,
        blurSize: 15,
        progressive: 1000,
        animation: true,
        animationDuration: 500,
        itemStyle: {
          borderRadius: 2,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
      },
      {
        name: '采砂区边界',
        type: 'line',
        smooth: false,
        showSymbol: false,
        lineStyle: {
          color: '#e53e3e',
          width: 2,
          type: 'dashed',
        },
        data: boundary && boundary.length > 0
          ? [...boundary, boundary[0]]
          : [
              [center[0] - 0.05, center[1] - 0.05],
              [center[0] + 0.05, center[1] - 0.05],
              [center[0] + 0.05, center[1] + 0.05],
              [center[0] - 0.05, center[1] + 0.05],
              [center[0] - 0.05, center[1] - 0.05],
            ],
      },
    ],
  }), [data, center, boundary]);

  return <ReactECharts option={option} style={{ height }} />;
}
