import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, TrendingDown, AlertTriangle, Heart, Mountain, Calendar, Download, Eye, BarChart3, PieChart } from 'lucide-react';
import { useAppStore } from '../../store';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart as PieChartComponent } from '../../components/charts/PieChart';
import { formatNumber, formatPercent, getRelativeTime } from '../../utils';
import { Select, Table, Tag, Button, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WeeklyReport } from '../../types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export function ReportsPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);
  const [filterProvince, setFilterProvince] = useState<string>('all');

  const { weeklyReports, provinceData, fetchWeeklyReports, fetchProvinceData } = useAppStore();

  useEffect(() => {
    fetchWeeklyReports();
    fetchProvinceData();
  }, [fetchWeeklyReports, fetchProvinceData]);

  const provinces = Array.from(new Set(provinceData.map(p => p.name))).sort();

  const miningTrendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    return {
      date: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      实际采砂量: 800 + Math.sin(i / 2) * 200 + Math.random() * 100,
      许可配额: 900 + Math.sin(i / 3) * 100,
    };
  });

  const provinceRankData = [...provinceData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      value: p.value,
    }));

  const healthDistributionData = [
    { name: '优秀 (≥90)', value: provinceData.filter(p => p.healthIndex >= 90).length },
    { name: '良好 (75-89)', value: provinceData.filter(p => p.healthIndex >= 75 && p.healthIndex < 90).length },
    { name: '一般 (60-74)', value: provinceData.filter(p => p.healthIndex >= 60 && p.healthIndex < 75).length },
    { name: '较差 (<60)', value: provinceData.filter(p => p.healthIndex < 60).length },
  ];

  const reportColumns: ColumnsType<WeeklyReport> = [
    {
      title: '报告日期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 120,
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '采砂区',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 200,
    },
    {
      title: '采砂量（万吨）',
      dataIndex: 'sandMiningAmount',
      key: 'sandMiningAmount',
      width: 140,
      align: 'right',
      render: (val) => <span className="font-semibold text-primary-700">{formatNumber(val, 2)}</span>,
    },
    {
      title: '同比',
      dataIndex: 'sandMiningYoy',
      key: 'sandMiningYoy',
      width: 100,
      align: 'right',
      render: (val) => (
        <span className={`flex items-center justify-end gap-1 ${val >= 0 ? 'text-danger-600' : 'text-success-600'}`}>
          {val >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {formatPercent(Math.abs(val), 1)}
        </span>
      ),
    },
    {
      title: '环比',
      dataIndex: 'sandMiningMom',
      key: 'sandMiningMom',
      width: 100,
      align: 'right',
      render: (val) => (
        <span className={`flex items-center justify-end gap-1 ${val >= 0 ? 'text-danger-600' : 'text-success-600'}`}>
          {val >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {formatPercent(Math.abs(val), 1)}
        </span>
      ),
    },
    {
      title: '超采事件',
      dataIndex: 'overMiningEvents',
      key: 'overMiningEvents',
      width: 100,
      align: 'center',
      render: (val) => (
        val > 0 ? (
          <Tag color="warning" className="flex items-center justify-center gap-1 m-0">
            <AlertTriangle size={12} />
            {val} 起
          </Tag>
        ) : (
          <span className="text-success-600">0 起</span>
        )
      ),
    },
    {
      title: '健康指数',
      dataIndex: 'healthIndex',
      key: 'healthIndex',
      width: 100,
      align: 'right',
      render: (val) => (
        <span className={val >= 80 ? 'text-success-600 font-semibold' : val >= 65 ? 'text-primary-600 font-semibold' : 'text-warning-600 font-semibold'}>
          {val.toFixed(1)}
        </span>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time) => (
        <div>
          <div className="text-gray-700">{getRelativeTime(time)}</div>
          <div className="text-xs text-gray-400">{new Date(time).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate('/reports/weekly')}
            className="text-primary-600 hover:text-primary-700"
            title="查看详情"
          >
            <Eye size={16} />
          </button>
          <button
            className="text-gray-500 hover:text-gray-700"
            title="下载报告"
          >
            <Download size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">统计报表</h2>
          <p className="text-gray-500 text-sm">查看采砂数据统计分析和各类报表</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports/weekly')}
            className="btn-outline flex items-center gap-1.5"
          >
            <FileText size={16} />
            周度诊断报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mountain size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{formatNumber(provinceData.reduce((sum, p) => sum + p.value, 0), 0)}</div>
              <div className="text-xs text-gray-500">本月总采砂量（万吨）</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Heart size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{(provinceData.reduce((sum, p) => sum + p.healthIndex, 0) / provinceData.length).toFixed(1)}</div>
              <div className="text-xs text-gray-500">平均健康指数</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{provinceData.filter(p => p.overMiningRate > 10).length}</div>
              <div className="text-xs text-gray-500">超采预警区域</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileText size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{weeklyReports.length}</div>
              <div className="text-xs text-gray-500">已生成报告</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates)}
            size="middle"
          />
        </div>
        <Select
          value={filterProvince}
          onChange={setFilterProvince}
          style={{ width: 150 }}
          size="middle"
          options={[
            { value: 'all', label: '全部省份' },
            ...provinces.map(p => ({ value: p, label: p })),
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-600" />
              采砂量趋势分析
            </h3>
            <Select
              defaultValue="month"
              style={{ width: 100 }}
              size="small"
              options={[
                { value: 'month', label: '月度' },
                { value: 'quarter', label: '季度' },
                { value: 'year', label: '年度' },
              ]}
            />
          </div>
          <LineChart
            data={miningTrendData}
            xField="date"
            series={[
              { key: '实际采砂量', name: '实际采砂量', color: '#1e3a5f', area: true },
              { key: '许可配额', name: '许可配额', color: '#dd6b20', dashed: true },
            ]}
            yAxisName="采砂量（万吨）"
            height={300}
            showLegend={true}
          />
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-primary-600" />
            健康指数分布
          </h3>
          <PieChartComponent
            data={healthDistributionData}
            height={300}
            title="健康分布"
          />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-600" />
          各省份采砂量排名（Top 10）
        </h3>
        <BarChart
          data={provinceRankData}
          xAxisName="采砂量（万吨）"
          height={350}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0 flex items-center gap-2">
            <FileText size={18} className="text-primary-600" />
            周度诊断报告列表
          </h3>
          <button
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Download size={14} />
            批量导出
          </button>
        </div>
        <Table
          columns={reportColumns}
          dataSource={weeklyReports}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            total: weeklyReports.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>
    </div>
  );
}
