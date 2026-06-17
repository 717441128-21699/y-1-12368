import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Filter, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { getWarningLevelColor, getWarningLevelText, getRelativeTime, formatPercent } from '../../utils';
import { WarningLevel, WarningStatus } from '../../types';
import { Input, Select, Table, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Warning } from '../../types';

export function WarningListPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { warnings, fetchWarnings } = useAppStore();

  useEffect(() => {
    fetchWarnings();
  }, [fetchWarnings]);

  const filteredWarnings = warnings.filter(warning => {
    const matchSearch = warning.areaName.toLowerCase().includes(searchText.toLowerCase()) ||
      warning.description.toLowerCase().includes(searchText.toLowerCase());
    const matchLevel = filterLevel === 'all' || warning.level === Number(filterLevel);
    const matchStatus = filterStatus === 'all' || warning.status === filterStatus;
    return matchSearch && matchLevel && matchStatus;
  });

  const getLevelBadge = (level: WarningLevel) => {
    const colors: Record<number, string> = {
      1: 'danger',
      2: 'warning',
      3: 'processing',
    };
    return <Tag color={colors[level]}>{getWarningLevelText(level)}</Tag>;
  };

  const getStatusBadge = (status: WarningStatus) => {
    const config: Record<string, { color: string; text: string }> = {
      pending: { color: 'warning', text: '待确认' },
      confirmed: { color: 'processing', text: '已确认待复核' },
      reviewed: { color: 'processing', text: '已复核待批准' },
      approved: { color: 'success', text: '已批准' },
      rejected: { color: 'error', text: '已驳回' },
      closed: { color: 'default', text: '已关闭' },
    };
    return <Tag color={config[status]?.color || 'default'}>{config[status]?.text || status}</Tag>;
  };

  const columns: ColumnsType<Warning> = [
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level) => getLevelBadge(level),
    },
    {
      title: '预警类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
    },
    {
      title: '预警描述',
      dataIndex: 'description',
      key: 'description',
      width: 280,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800">{record.areaName}</div>
          <div className="text-sm text-gray-500 mt-0.5">{text}</div>
        </div>
      ),
    },
    {
      title: '超采率/下降速率',
      key: 'metrics',
      width: 150,
      render: (_, record) => (
        <div>
          {record.overMiningRate !== undefined && (
            <div className="text-danger-600 font-semibold">超采率: {formatPercent(record.overMiningRate, 1)}</div>
          )}
          {record.waterDropRate !== undefined && (
            <div className="text-warning-600 font-semibold">下降速率: {record.waterDropRate.toFixed(3)}m/h</div>
          )}
        </div>
      ),
    },
    {
      title: '当前审批节点',
      dataIndex: 'currentNode',
      key: 'currentNode',
      width: 150,
      render: (node, record) => (
        <div>
          <div className="font-medium text-gray-800">
            {node < record.approvalFlow.length ? record.approvalFlow[node]?.nodeName : '已完成'}
          </div>
          <div className="text-xs text-gray-500">第 {Math.min(node + 1, record.approvalFlow.length)} / {record.approvalFlow.length} 节点</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => getStatusBadge(status),
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      width: 150,
      render: (time) => (
        <div>
          <div className="text-gray-800">{getRelativeTime(time)}</div>
          <div className="text-xs text-gray-400">{new Date(time).toLocaleString()}</div>
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
        <button
          onClick={() => navigate(`/warning/${record.id}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
        >
          <Eye size={14} />
          详情
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">预警管理</h2>
          <p className="text-gray-500 text-sm">管理和处置各类采砂预警信息</p>
        </div>
        <div className="flex items-center gap-3">
          <Tag color="red">
            <AlertTriangle size={12} className="inline mr-1" />
            一级预警 {warnings.filter(w => w.level === 1).length}
          </Tag>
          <Tag color="orange">二级预警 {warnings.filter(w => w.level === 2).length}</Tag>
          <Tag color="blue">三级预警 {warnings.filter(w => w.level === 3).length}</Tag>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索预警描述、采砂区名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
              size="middle"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <Select
              value={filterLevel}
              onChange={setFilterLevel}
              style={{ width: 130 }}
              size="middle"
              options={[
                { value: 'all', label: '全部级别' },
                { value: '1', label: '一级预警' },
                { value: '2', label: '二级预警' },
                { value: '3', label: '三级预警' },
              ]}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 130 }}
              size="middle"
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待确认' },
                { value: 'confirmed', label: '已确认' },
                { value: 'reviewed', label: '已复核' },
                { value: 'approved', label: '已批准' },
                { value: 'rejected', label: '已驳回' },
                { value: 'closed', label: '已关闭' },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredWarnings}
          rowKey="id"
          scroll={{ x: 1150 }}
          rowClassName={(record) => record.level === 1 ? 'bg-red-50/50' : ''}
          pagination={{
            total: filteredWarnings.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>
    </div>
  );
}
