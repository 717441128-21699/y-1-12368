import { useEffect } from 'react';
import { Mountain, Activity, Heart, Truck, AlertTriangle, FileCheck } from 'lucide-react';
import { useAppStore } from '../../store';
import { MetricCard } from '../../components/common/MetricCard';
import { ProvinceHeatmap } from '../../components/map/ProvinceHeatmap';
import { LineChart } from '../../components/charts/LineChart';
import { HealthRankList } from './components/HealthRankList';
import { WarningList } from './components/WarningList';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { formatNumber } from '../../utils';

export function DashboardPage() {
  const {
    dashboardMetrics,
    provinceData,
    healthRank,
    trendData,
    warnings,
    fetchDashboardMetrics,
    fetchProvinceData,
    fetchHealthRank,
    fetchTrendData,
    fetchWarnings,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  } = useAppStore();

  useEffect(() => {
    fetchDashboardMetrics();
    fetchProvinceData();
    fetchHealthRank();
    fetchTrendData();
    fetchWarnings();
    startRealTimeUpdates();

    return () => stopRealTimeUpdates();
  }, [fetchDashboardMetrics, fetchProvinceData, fetchHealthRank, fetchTrendData, fetchWarnings, startRealTimeUpdates, stopRealTimeUpdates]);

  const handleProvinceClick = (provinceName: string) => {
    console.log('Selected province:', provinceName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">监管总览</h2>
          <p className="text-gray-500 text-sm">实时监控全国河道采砂与河道健康状况</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            实时数据更新中
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="今日采砂量"
          value={dashboardMetrics?.totalSandMining || 0}
          unit="万吨"
          trend={dashboardMetrics?.yoyGrowth}
          gradient="blue"
          icon={<Mountain size={24} />}
        />
        <MetricCard
          title="超采率"
          value={dashboardMetrics?.overMiningRate || 0}
          isPercent
          trend={2.3}
          gradient="orange"
          icon={<Activity size={24} />}
        />
        <MetricCard
          title="河道健康指数"
          value={dashboardMetrics?.healthIndex || 0}
          unit="分"
          trend={1.5}
          gradient="green"
          icon={<Heart size={24} />}
        />
        <MetricCard
          title="运输合规率"
          value={dashboardMetrics?.complianceRate || 0}
          isPercent
          trend={0.8}
          gradient="green"
          icon={<Truck size={24} />}
        />
        <MetricCard
          title="活跃预警"
          value={dashboardMetrics?.activeWarningCount || 0}
          unit="条"
          gradient="red"
          icon={<AlertTriangle size={24} />}
        />
        <MetricCard
          title="待审批"
          value={dashboardMetrics?.pendingApprovalCount || 0}
          unit="项"
          gradient="orange"
          icon={<FileCheck size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">全国采砂热力分布图</h3>
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-primary-700">{provinceData.length}</span> 个省级行政区
            </div>
          </div>
          <ProvinceHeatmap
            data={provinceData.map(p => ({ name: p.name, value: p.value }))}
            onProvinceClick={handleProvinceClick}
            height={420}
          />
        </div>

        <div className="card p-5">
          <h3 className="section-title">河道健康指数排名</h3>
          <HealthRankList data={healthRank} />
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
          <h3 className="section-title">核心指标监测</h3>
          <div className="grid grid-cols-2 gap-4">
            <GaugeChart
              value={dashboardMetrics?.healthIndex || 0}
              title="健康指数"
              unit="分"
            />
            <GaugeChart
              value={dashboardMetrics?.complianceRate || 0}
              title="合规率"
              unit="%"
            />
            <GaugeChart
              value={100 - (dashboardMetrics?.overMiningRate || 0)}
              title="采砂规范度"
              unit="%"
            />
            <GaugeChart
              value={85 + Math.random() * 10}
              title="水位安全度"
              unit="%"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">最新预警</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-danger-500 rounded-full" />
                一级预警 <span className="font-semibold">{warnings.filter(w => w.level === 1).length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-warning-500 rounded-full" />
                二级预警 <span className="font-semibold">{warnings.filter(w => w.level === 2).length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
                三级预警 <span className="font-semibold">{warnings.filter(w => w.level === 3).length}</span>
              </span>
            </div>
          </div>
          <WarningList data={warnings} />
        </div>

        <div className="card p-5">
          <h3 className="section-title">各省份采砂数据概览</h3>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">省份</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">采砂量</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">超采率</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">健康指数</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">采砂区数</th>
                </tr>
              </thead>
              <tbody>
                {provinceData.slice(0, 15).map((province, index) => (
                  <tr
                    key={province.name}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-800">{province.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-2 font-semibold text-gray-800">
                      {formatNumber(province.value, 2)}万吨
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <span className={province.overMiningRate > 20 ? 'text-danger-600 font-semibold' : province.overMiningRate > 10 ? 'text-warning-600 font-semibold' : 'text-success-600 font-semibold'}>
                        {province.overMiningRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <span className={province.healthIndex >= 80 ? 'text-success-600 font-semibold' : province.healthIndex >= 65 ? 'text-primary-600 font-semibold' : 'text-warning-600 font-semibold'}>
                        {province.healthIndex.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-2 text-gray-600">
                      {province.miningAreaCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
