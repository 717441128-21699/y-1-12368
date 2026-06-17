import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Mountain, TrendingUp, TrendingDown,
  AlertTriangle, Heart, Droplets, Download, Share2, Calendar,
  Lightbulb, BarChart3, MapPin, CheckCircle
} from 'lucide-react';
import { useAppStore } from '../../store';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { formatNumber, formatPercent, getRelativeTime } from '../../utils';
import { Spin, Tag, Button } from 'antd';

export function WeeklyReportPage() {
  const navigate = useNavigate();

  const { weeklyReports, fetchWeeklyReports } = useAppStore();

  useEffect(() => {
    fetchWeeklyReports();
  }, [fetchWeeklyReports]);

  const report = weeklyReports[0];

  if (!report) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const trendData = Array.from({ length: 8 }, (_, i) => {
    const week = new Date();
    week.setDate(week.getDate() - (7 - i) * 7);
    return {
      date: `${week.getMonth() + 1}/${week.getDate()}`,
      value: 800 + Math.sin(i / 2) * 200 + Math.random() * 100,
      target: 900,
    };
  });

  const overMiningDistribution = [
    { name: '超采10%-20%', value: Math.floor(Math.random() * 5) + 1 },
    { name: '超采20%-30%', value: Math.floor(Math.random() * 3) },
    { name: '超采30%以上', value: Math.floor(Math.random() * 2) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回报表</span>
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">河道健康周度诊断报告</h2>
            <p className="text-gray-500 text-sm mt-1">报告日期: {report.reportDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-1.5">
            <Share2 size={16} />
            分享
          </button>
          <button className="btn-primary flex items-center gap-1.5">
            <Download size={16} />
            下载报告
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={24} />
              <span className="text-lg font-medium">河道健康诊断报告</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">{report.areaName}</h1>
            <p className="text-white/80 flex items-center gap-2">
              <Calendar size={14} />
              {report.reportDate} 第 {Math.ceil(new Date(report.reportDate).getDate() / 7)} 周
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">{report.healthIndex.toFixed(1)}</div>
            <div className="text-white/80 mt-1">健康指数</div>
            <div className={`flex items-center justify-end gap-1 mt-2 ${report.healthIndexMom >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {report.healthIndexMom >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              较上周 {report.healthIndexMom >= 0 ? '+' : ''}{report.healthIndexMom.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mountain size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">本周采砂量</div>
              <div className="text-2xl font-bold text-gray-800">{formatNumber(report.sandMiningAmount, 2)}万吨</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-1 ${report.sandMiningYoy >= 0 ? 'text-danger-600' : 'text-success-600'}`}>
              {report.sandMiningYoy >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              同比 {formatPercent(Math.abs(report.sandMiningYoy), 1)}
            </span>
            <span className={`flex items-center gap-1 ${report.sandMiningMom >= 0 ? 'text-danger-600' : 'text-success-600'}`}>
              {report.sandMiningMom >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              环比 {formatPercent(Math.abs(report.sandMiningMom), 1)}
            </span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">超采事件</div>
              <div className="text-2xl font-bold text-gray-800">{report.overMiningEvents} 起</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {report.overMiningEvents > 0
              ? `较上周 ${report.overMiningEvents > 2 ? '增加' : '减少'}，需加强监管`
              : '本周无超采事件，监管良好'}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Heart size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">健康指数</div>
              <div className="text-2xl font-bold text-gray-800">{report.healthIndex.toFixed(1)}</div>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm ${report.healthIndexMom >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {report.healthIndexMom >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            较上周 {report.healthIndexMom >= 0 ? '上升' : '下降'} {Math.abs(report.healthIndexMom).toFixed(1)} 分
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Droplets size={20} className="text-cyan-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">河道淤积</div>
              <div className="text-2xl font-bold text-gray-800">{report.siltationAssessment.includes('轻微') ? '轻微' : '明显'}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {report.siltationAssessment.includes('轻微')
              ? '淤积情况可控，建议持续监测'
              : '淤积明显，建议安排清淤作业'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-600" />
            采砂量趋势（近8周）
          </h3>
          <LineChart
            data={trendData}
            yAxisName="采砂量（万吨）"
            height={300}
            showLegend={true}
          />
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning-600" />
            超采事件分布
          </h3>
          <BarChart
            data={overMiningDistribution}
            xAxisName="起数"
            height={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-cyan-600" />
            河道淤积评估
          </h3>
          <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
            <p className="text-gray-700 leading-relaxed">{report.siltationAssessment}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">平均水深</div>
              <div className="text-xl font-bold text-gray-800">8.5m</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">淤积厚度</div>
              <div className="text-xl font-bold text-gray-800">0.8m</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">过水断面</div>
              <div className="text-xl font-bold text-gray-800">1200m²</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            优化建议
          </h3>
          <div className="space-y-3">
            {report.recommendations.split('\n').map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-primary-600" />
          监督重点推荐
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-primary-200 rounded-xl bg-primary-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-primary-600" />
              <span className="font-semibold text-primary-700">重点采砂区</span>
            </div>
            <p className="text-sm text-gray-600">建议加强对 {report.areaName} 等3个采砂区的日常巡查，加密监测频次</p>
          </div>
          <div className="p-4 border-2 border-warning-200 rounded-xl bg-warning-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-warning-600" />
              <span className="font-semibold text-warning-700">重点时段</span>
            </div>
            <p className="text-sm text-gray-600">建议在汛期和枯水期加强监管，防止超量开采影响河道安全</p>
          </div>
          <div className="p-4 border-2 border-success-200 rounded-xl bg-success-50">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={18} className="text-success-600" />
              <span className="font-semibold text-success-700">生态保护</span>
            </div>
            <p className="text-sm text-gray-600">建议在鱼类洄游期采取限采措施，保护水生生物栖息地</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          报告生成时间: {new Date(report.createTime).toLocaleString()}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/reports')}>
            返回列表
          </Button>
          <Button type="primary" icon={<Download size={14} />}>
            下载PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
