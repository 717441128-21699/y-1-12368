import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Mountain, AlertTriangle, Calendar, User, Clock, FileCheck, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MetricCard } from '../../components/common/MetricCard';
import { LineChart } from '../../components/charts/LineChart';
import { formatNumber, formatPercent, getRelativeTime } from '../../utils';
import { PermitStatus, WorkOrderStatus } from '../../types';
import { Spin, Tag, Button } from 'antd';

export function PermitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentPermit,
    workOrders,
    fetchPermits,
    selectPermit,
    fetchWorkOrders,
  } = useAppStore();

  useEffect(() => {
    if (id) {
      fetchPermits();
      selectPermit(id);
      fetchWorkOrders();
    }
    return () => selectPermit(null);
  }, [id, fetchPermits, selectPermit, fetchWorkOrders]);

  if (!currentPermit) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const relatedWorkOrders = workOrders.filter(o => o.permitId === currentPermit.id);

  const comparisonData = [
    { label: '许可采砂量', value: currentPermit.permittedAmount, unit: '万吨', color: 'text-primary-600' },
    { label: '实际采砂量', value: currentPermit.actualAmount, unit: '万吨', color: 'text-primary-700' },
    { label: '超限数量', value: Math.max(0, currentPermit.actualAmount - currentPermit.permittedAmount), unit: '万吨', color: 'text-danger-600' },
    { label: '超限率', value: currentPermit.exceedRate, unit: '%', color: currentPermit.exceedRate > 10 ? 'text-danger-600' : 'text-warning-600', isPercent: true },
  ];

  const trendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    const base = currentPermit.permittedAmount / 12;
    return {
      date: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      value: base + Math.sin(i / 2) * base * 0.3 + Math.random() * base * 0.2,
      target: base,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/permit')}
            className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回列表</span>
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">{currentPermit.permitNo}</h2>
            <p className="text-gray-500 text-sm mt-1">{currentPermit.areaName}</p>
          </div>
        </div>
        <StatusBadge status={currentPermit.status as any} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="许可采砂量"
          value={currentPermit.permittedAmount}
          unit="万吨"
          gradient="blue"
          icon={<Mountain size={24} />}
        />
        <MetricCard
          title="实际采砂量"
          value={currentPermit.actualAmount}
          unit="万吨"
          gradient="orange"
          icon={<Mountain size={24} />}
          trend={currentPermit.exceedRate > 0 ? currentPermit.exceedRate : -currentPermit.exceedRate}
        />
        <MetricCard
          title="超限率"
          value={currentPermit.exceedRate}
          isPercent
          gradient={currentPermit.exceedRate > 10 ? 'red' : 'orange'}
          icon={<AlertTriangle size={24} />}
        />
        <MetricCard
          title="关联工单"
          value={relatedWorkOrders.length}
          unit="条"
          gradient="purple"
          icon={<FileCheck size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="section-title mb-4">许可详情</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">许可证号</label>
                  <div className="font-medium text-gray-800">{currentPermit.permitNo}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">采砂区</label>
                  <div className="font-medium text-gray-800">{currentPermit.areaName}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">采砂企业</label>
                  <div className="font-medium text-gray-800">{currentPermit.enterprise}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">状态</label>
                  <StatusBadge status={currentPermit.status as any} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">有效期起</label>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {currentPermit.validFrom}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">有效期止</label>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {currentPermit.validTo}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">创建时间</label>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(currentPermit.createTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">月度采砂量趋势</h3>
            <LineChart
              data={trendData}
              yAxisName="采砂量（万吨）"
              height={300}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="section-title mb-4">数据比对</h3>
            <div className="space-y-3">
              {comparisonData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>
                    {item.isPercent ? formatPercent(item.value, 1) : formatNumber(item.value, 2)}{item.unit}
                  </span>
                </div>
              ))}
            </div>

            {currentPermit.exceedRate > 10 && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">已触发异常工单</div>
                    <p className="text-sm text-red-600 mt-1">
                      实际采砂量已超出许可量10%，系统已自动生成异常工单并推送至执法人员
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {relatedWorkOrders.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title mb-4">关联工单</h3>
              <div className="space-y-3">
                {relatedWorkOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate({
                      pathname: '/work-order',
                      search: `?orderId=${order.id}&status=${order.status}&assignee=${order.assignee}`,
                    })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 text-sm">{order.id}</span>
                      <Tag
                        color={
                          order.status === WorkOrderStatus.PENDING ? 'warning' :
                          order.status === WorkOrderStatus.PROCESSING ? 'processing' : 'success'
                        }
                      >
                        {order.status === WorkOrderStatus.PENDING ? '待处理' :
                         order.status === WorkOrderStatus.PROCESSING ? '处理中' : '已关闭'}
                      </Tag>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{order.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1 text-gray-500">
                        <User size={12} />
                        <span>指派：{order.assigneeName || '未指派'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={12} />
                        <span>{getRelativeTime(order.createTime)}</span>
                      </div>
                    </div>
                    
                    {order.status === WorkOrderStatus.CLOSED && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">处理人：</span>
                          <span className="text-gray-700 font-medium">{order.handleByName || '-'}</span>
                        </div>
                        {order.handleTime && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">处理时间：</span>
                            <span className="text-gray-700">{new Date(order.handleTime).toLocaleString()}</span>
                          </div>
                        )}
                        {order.handleResult && (
                          <div className="text-xs">
                            <span className="text-gray-500 block mb-1">处理结果：</span>
                            <p className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                              {order.handleResult}
                            </p>
                          </div>
                        )}
                        {order.siteNote && (
                          <div className="text-xs">
                            <span className="text-gray-500 block mb-1">现场说明：</span>
                            <p className="text-gray-600 bg-white p-2 rounded border border-gray-200">
                              {order.siteNote}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end mt-2">
                      <span className="text-xs text-primary-600 flex items-center gap-1">
                        查看工单 <ExternalLink size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
