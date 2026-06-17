import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mountain, Activity, Heart, Ship, MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppStore } from '../../store';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrajectoryHeatmap } from '../../components/map/TrajectoryHeatmap';
import { PieChart } from '../../components/charts/PieChart';
import { LineChart } from '../../components/charts/LineChart';
import { formatNumber, formatPercent } from '../../utils';
import { Spin } from 'antd';

export function MiningAreaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentArea,
    areaShips,
    waterMonitorData,
    weighingRecords,
    transportFlowData,
    heatmapData,
    fetchAreaDetail,
    fetchMiningAreas,
  } = useAppStore();

  useEffect(() => {
    if (id) {
      fetchMiningAreas();
      fetchAreaDetail(id);
    }
  }, [id, fetchMiningAreas, fetchAreaDetail]);

  if (!currentArea) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      value: currentArea.permittedAmount / 30 + Math.sin(i / 5) * 5 + Math.random() * 10,
      target: currentArea.permittedAmount / 30,
    };
  });

  const pieData = transportFlowData.map(item => ({
    name: item.destination,
    value: item.value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/mining-area')}
            className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回列表</span>
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">{currentArea.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={14} />
                {currentArea.province} {currentArea.city} {currentArea.county}
              </span>
              <StatusBadge status={currentArea.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={14} />
          创建时间: {new Date(currentArea.createTime).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="许可采砂量"
          value={currentArea.permittedAmount}
          unit="万吨"
          gradient="blue"
          icon={<Mountain size={24} />}
        />
        <MetricCard
          title="实际采砂量"
          value={currentArea.actualAmount}
          unit="万吨"
          gradient="orange"
          icon={<Mountain size={24} />}
          trend={currentArea.overMiningRate > 0 ? currentArea.overMiningRate : -currentArea.overMiningRate}
        />
        <MetricCard
          title="超采率"
          value={currentArea.overMiningRate}
          isPercent
          gradient="orange"
          icon={<Activity size={24} />}
        />
        <MetricCard
          title="健康指数"
          value={currentArea.healthIndex}
          unit="分"
          gradient="green"
          icon={<Heart size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">采砂船近7天作业轨迹热力图</h3>
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-primary-700">{heatmapData.length}</span> 个轨迹点
            </div>
          </div>
          <TrajectoryHeatmap
            data={heatmapData}
            boundary={currentArea.boundary}
            height={400}
          />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">砂石运输流向占比</h3>
            <div className="text-sm text-gray-500">
              近7天运输 <span className="font-semibold text-primary-700">{formatNumber(transportFlowData.reduce((sum, item) => sum + item.value, 0), 2)}</span> 万吨
            </div>
          </div>
          <PieChart
            data={pieData}
            height={400}
            title="运输流向"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="section-title">采砂量趋势分析（近30天）</h3>
          <LineChart
            data={trendData}
            yAxisName="采砂量（万吨）"
            height={300}
          />
        </div>

        <div className="card p-5">
          <h3 className="section-title">运输流向明细</h3>
          <div className="space-y-3">
            {transportFlowData.map((item, index) => (
              <div
                key={item.destination}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{item.destination}</div>
                    <div className="text-xs text-gray-500">{formatNumber(item.value, 2)}万吨</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">{item.percentage}%</div>
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">采砂船列表</h3>
          <div className="text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Ship size={14} className="text-success-500" />
              活跃 {currentArea.activeShips}/{currentArea.shipCount} 艘
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">船名</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">MMSI</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">所属企业</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">今日产量</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">累计产量</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">最后更新</th>
              </tr>
            </thead>
            <tbody>
              {areaShips.map((ship) => (
                <tr key={ship.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{ship.name}</td>
                  <td className="py-3 px-4 text-gray-600">{ship.mmsi}</td>
                  <td className="py-3 px-4 text-gray-600">{ship.enterprise}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={ship.currentStatus as any} />
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-800">{formatNumber(ship.todayOutput, 2)}吨</td>
                  <td className="py-3 px-4 text-right font-semibold text-primary-700">{formatNumber(ship.totalOutput / 10000, 2)}万吨</td>
                  <td className="py-3 px-4 text-right text-gray-500">{new Date(ship.lastUpdate).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title">过磅记录（近7天）</h3>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">车牌号</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">重量（吨）</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">目的地</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">是否合规</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">过磅时间</th>
              </tr>
            </thead>
            <tbody>
              {weighingRecords.slice(0, 20).map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-gray-800">{record.vehicleNo}</td>
                  <td className="py-2.5 px-4 font-semibold text-gray-800">{record.weight.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-gray-600">{record.destination}</td>
                  <td className="py-2.5 px-4">
                    {record.isCompliant ? (
                      <span className="inline-flex items-center gap-1 text-success-600">
                        <span className="w-2 h-2 bg-success-500 rounded-full" />
                        合规
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-danger-600">
                        <span className="w-2 h-2 bg-danger-500 rounded-full" />
                        超限
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{new Date(record.weighTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
