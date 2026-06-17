import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, MapPin, AlertTriangle, Ship } from 'lucide-react';
import { useAppStore } from '../../store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatNumber, formatPercent, getStatusClass, getStatusText } from '../../utils';
import { Input, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MiningArea } from '../../types';

export function MiningAreaListPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { miningAreas, fetchMiningAreas } = useAppStore();

  useEffect(() => {
    fetchMiningAreas();
  }, [fetchMiningAreas]);

  const filteredAreas = miningAreas.filter(area => {
    const matchSearch = area.name.toLowerCase().includes(searchText.toLowerCase()) ||
      area.province.toLowerCase().includes(searchText.toLowerCase());
    const matchProvince = filterProvince === 'all' || area.province === filterProvince;
    const matchStatus = filterStatus === 'all' || area.status === filterStatus;
    return matchSearch && matchProvince && matchStatus;
  });

  const provinces = Array.from(new Set(miningAreas.map(a => a.province))).sort();

  const columns: ColumnsType<MiningArea> = [
    {
      title: '采砂区名称',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary-500 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-800">{text}</div>
            <div className="text-xs text-gray-500">{record.province} {record.city}</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: '许可采砂量',
      dataIndex: 'permittedAmount',
      key: 'permittedAmount',
      width: 130,
      align: 'right',
      render: (val) => <span className="font-medium">{formatNumber(val, 2)}万吨</span>,
    },
    {
      title: '实际采砂量',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 130,
      align: 'right',
      render: (val) => <span className="font-semibold text-primary-700">{formatNumber(val, 2)}万吨</span>,
    },
    {
      title: '超采率',
      dataIndex: 'overMiningRate',
      key: 'overMiningRate',
      width: 110,
      align: 'right',
      render: (val) => (
        <span className={val > 20 ? 'text-danger-600 font-semibold' : val > 10 ? 'text-warning-600 font-semibold' : 'text-success-600 font-semibold'}>
          {formatPercent(val, 1)}
        </span>
      ),
    },
    {
      title: '健康指数',
      dataIndex: 'healthIndex',
      key: 'healthIndex',
      width: 110,
      align: 'right',
      render: (val) => (
        <span className={val >= 80 ? 'text-success-600 font-semibold' : val >= 65 ? 'text-primary-600 font-semibold' : 'text-warning-600 font-semibold'}>
          {val.toFixed(1)}
        </span>
      ),
    },
    {
      title: '采砂船',
      dataIndex: 'activeShips',
      key: 'ships',
      width: 100,
      align: 'center',
      render: (val, record) => (
        <div className="flex items-center justify-center gap-1">
          <Ship size={14} className="text-gray-400" />
          <span>{val}/{record.shipCount}</span>
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
          onClick={() => navigate(`/mining-area/${record.id}`)}
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
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">采砂区管理</h2>
          <p className="text-gray-500 text-sm">管理和查看全国各采砂区的详细信息</p>
        </div>
        <div className="flex items-center gap-3">
          <Tag color="green">{filteredAreas.filter(a => a.status === 'normal').length} 正常</Tag>
          <Tag color="orange">{filteredAreas.filter(a => a.status === 'suspended').length} 停采</Tag>
          <Tag color="red">{filteredAreas.filter(a => a.status === 'warning').length} 预警</Tag>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索采砂区名称、省份..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
              size="middle"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
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
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              size="middle"
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'normal', label: '正常' },
                { value: 'warning', label: '预警' },
                { value: 'suspended', label: '停采' },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAreas}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            total: filteredAreas.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>
    </div>
  );
}
