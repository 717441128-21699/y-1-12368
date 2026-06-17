import { Droplets, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart } from '../../../components/charts/LineChart';
import type { WaterMonitorData } from '../../../types';

interface WaterMonitorProps {
  data: WaterMonitorData[];
}

export function WaterMonitor({ data }: WaterMonitorProps) {
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  const avgWaterLevel = data.length > 0 ? data.reduce((sum, d) => sum + d.waterLevel, 0) / data.length : 0;
  const avgFlowRate = data.length > 0 ? data.reduce((sum, d) => sum + d.flowRate, 0) / data.length : 0;
  const maxDropRate = data.length > 0 ? Math.max(...data.map(d => d.dropRate)) : 0;

  const chartData = data.slice(-24).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    水位: d.waterLevel,
    流量: d.flowRate,
  }));

  const isDropRateWarning = maxDropRate > 0.5;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Droplets size={16} className="text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">当前水位</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {latestData?.waterLevel.toFixed(2) || '--'}
            <span className="text-sm font-normal ml-1">m</span>
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">
            平均 {avgWaterLevel.toFixed(2)}m
          </div>
        </div>

        <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-cyan-600" />
            <span className="text-xs text-cyan-700 font-medium">瞬时流量</span>
          </div>
          <div className="text-2xl font-bold text-cyan-800">
            {latestData?.flowRate.toFixed(1) || '--'}
            <span className="text-sm font-normal ml-1">m³/s</span>
          </div>
          <div className="text-[10px] text-cyan-600 mt-0.5">
            平均 {avgFlowRate.toFixed(1)}m³/s
          </div>
        </div>

        <div className={`p-3 rounded-xl ${
          isDropRateWarning 
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : 'bg-gradient-to-br from-green-50 to-green-100'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {isDropRateWarning 
              ? <AlertTriangle size={16} className="text-red-600" />
              : <TrendingDown size={16} className="text-green-600" />
            }
            <span className={`text-xs font-medium ${isDropRateWarning ? 'text-red-700' : 'text-green-700'}`}>
              下降速率
            </span>
          </div>
          <div className={`text-2xl font-bold ${isDropRateWarning ? 'text-red-800' : 'text-green-800'}`}>
            {latestData?.dropRate.toFixed(3) || '--'}
            <span className="text-sm font-normal ml-1">m/h</span>
          </div>
          <div className={`text-[10px] mt-0.5 ${isDropRateWarning ? 'text-red-600' : 'text-green-600'}`}>
            最大 {maxDropRate.toFixed(3)}m/h
          </div>
        </div>

        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">监测点数</span>
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {data.length}
            <span className="text-sm font-normal ml-1">个</span>
          </div>
          <div className="text-[10px] text-purple-600 mt-0.5">
            近48小时数据
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h4 className="font-semibold text-gray-800 mb-3">水位流量趋势（近24小时）</h4>
        <LineChart
          data={chartData}
          xField="time"
          series={[
            { key: '水位', name: '水位(m)', color: '#1e3a5f', area: true },
            { key: '流量', name: '流量(m³/s)', color: '#0891b2', area: false },
          ]}
          yAxisName="数值"
          height={220}
          showLegend={true}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">警戒水位</div>
          <div className="text-lg font-bold text-gray-800">12.50m</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">保证水位</div>
          <div className="text-lg font-bold text-gray-800">15.00m</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">下降阈值</div>
          <div className="text-lg font-bold text-warning-600">0.50m/h</div>
        </div>
      </div>
    </div>
  );
}
