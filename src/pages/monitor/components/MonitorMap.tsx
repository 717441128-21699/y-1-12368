import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import type { MiningArea, MiningShip } from '../../../types';
import chinaJson from '../../../components/map/china.json';

interface MonitorMapProps {
  areas: MiningArea[];
  ships: MiningShip[];
  selectedAreaId: string | null;
  selectedShipId: string | null;
  onAreaClick: (areaId: string) => void;
  onShipClick: (shipId: string) => void;
  height?: number;
}

export function MonitorMap({
  areas,
  ships,
  selectedAreaId,
  selectedShipId,
  onAreaClick,
  onShipClick,
  height = 500,
}: MonitorMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!echarts.getMap('china')) {
      echarts.registerMap('china', chinaJson as any);
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const areaPoints = areas.map(area => ({
      name: area.name,
      value: [...area.center, area.actualAmount, area.id, area.status],
      itemStyle: {
        color: area.status === 'warning' ? '#ef4444' : area.status === 'suspended' ? '#f59e0b' : '#10b981',
      },
    }));

    const shipPoints = ships.map(ship => ({
      name: ship.name,
      value: [...ship.currentLocation, ship.todayOutput, ship.id, ship.currentStatus],
      itemStyle: {
        color: ship.currentStatus === 'mining' ? '#10b981' : ship.currentStatus === 'transporting' ? '#3b82f6' : '#9ca3af',
      },
    }));

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesName === '采砂区') {
            const area = areas.find(a => a.id === params.value[3]);
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
                <div>状态: ${area?.status === 'warning' ? '<span style="color: #ef4444;">预警</span>' : area?.status === 'suspended' ? '<span style="color: #f59e0b;">停采</span>' : '<span style="color: #10b981;">正常</span>'}</div>
                <div>采砂量: ${params.value[2].toFixed(2)}万吨</div>
                <div>超采率: ${area?.overMiningRate.toFixed(1)}%</div>
                <div>健康指数: ${area?.healthIndex.toFixed(1)}</div>
                <div>采砂船: ${area?.activeShips}/${area?.shipCount}艘</div>
              </div>
            `;
          } else if (params.seriesName === '采砂船') {
            const ship = ships.find(s => s.id === params.value[3]);
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
                <div>状态: ${ship?.currentStatus === 'mining' ? '<span style="color: #10b981;">作业中</span>' : ship?.currentStatus === 'transporting' ? '<span style="color: #3b82f6;">运输中</span>' : '<span style="color: #9ca3af;">空闲</span>'}</div>
                <div>今日产量: ${params.value[2].toFixed(2)}吨</div>
                <div>累计产量: ${(ship?.totalOutput || 0 / 10000).toFixed(2)}万吨</div>
                <div>MMSI: ${ship?.mmsi}</div>
              </div>
            `;
          }
          return '';
        },
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10,
          color: '#64748b',
        },
        itemStyle: {
          areaColor: '#f1f5f9',
          borderColor: '#cbd5e1',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#e2e8f0',
          },
          label: {
            color: '#1e3a5f',
          },
        },
      },
      series: [
        {
          name: '采砂区',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: areaPoints,
          symbolSize: (val: any) => Math.max(12, Math.min(25, val[2] / 5)),
          encode: {
            value: 2,
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          emphasis: {
            scale: 1.3,
          },
        },
        {
          name: '采砂船',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: shipPoints,
          symbol: 'triangle',
          symbolSize: 10,
          itemStyle: {
            borderWidth: 1,
            borderColor: '#fff',
          },
          emphasis: {
            scale: 1.5,
          },
        },
      ],
    };

    chartInstanceRef.current.setOption(option, true);

    chartInstanceRef.current.off('click');
    chartInstanceRef.current.on('click', (params: any) => {
      if (params.seriesName === '采砂区') {
        onAreaClick(params.value[3]);
      } else if (params.seriesName === '采砂船') {
        onShipClick(params.value[3]);
      }
    });
  }, [areas, ships, selectedAreaId, selectedShipId, onAreaClick, onShipClick]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height }} />
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">图例</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">正常采砂区</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">停采采砂区</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">预警采砂区</span>
          </div>
          <div className="border-t border-gray-200 pt-1.5 mt-1.5">
            <div className="flex items-center gap-2">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-green-500" />
              <span className="text-xs text-gray-600">作业中</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-blue-500" />
            <span className="text-xs text-gray-600">运输中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-gray-400" />
            <span className="text-xs text-gray-600">空闲</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => chartInstanceRef.current?.dispatchAction({ type: 'zoom', dataZoomIndex: 0, start: 0, end: 100 })}
          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
        >
          +
        </button>
        <button
          onClick={() => chartInstanceRef.current?.dispatchAction({ type: 'back' })}
          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
        >
          −
        </button>
      </div>
    </div>
  );
}
