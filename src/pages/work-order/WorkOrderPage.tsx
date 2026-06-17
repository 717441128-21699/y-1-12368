import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, FileText, AlertTriangle, User, Clock, CheckCircle, XCircle, MessageSquare, MapPin, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store';
import { formatNumber, formatPercent, getRelativeTime } from '../../utils';
import { WorkOrderStatus } from '../../types';
import { Input, Select, Table, Tag, Button, Modal, Form, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WorkOrder } from '../../types';

const LAW_ENFORCERS = [
  { value: 'law001', label: '执法人员王队' },
  { value: 'law002', label: '执法人员李队' },
];

export function WorkOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, workOrders, fetchWorkOrders, handleWorkOrder } = useAppStore();
  
  const isLawEnforcement = user?.role === 'law_enforcement';
  const currentUserId = user?.userId || '';
  
  const urlStatus = searchParams.get('status') || 'all';
  const urlAssignee = searchParams.get('assignee') || '';
  const urlOrderId = searchParams.get('orderId') || '';
  
  const defaultAssignee = isLawEnforcement ? currentUserId : (urlAssignee || 'all');
  
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(urlStatus);
  const [filterAssignee, setFilterAssignee] = useState<string>(defaultAssignee);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(urlOrderId);
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [handleResult, setHandleResult] = useState('');
  const [siteNote, setSiteNote] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    const filters: Partial<WorkOrder> = {};
    if (filterStatus && filterStatus !== 'all') {
      (filters as any).status = filterStatus;
    }
    if (filterAssignee && filterAssignee !== 'all') {
      (filters as any).assignee = filterAssignee;
    }
    fetchWorkOrders(filters);
    setSearchParams({ status: filterStatus, assignee: filterAssignee }, { replace: true });
  }, [fetchWorkOrders, filterStatus, filterAssignee, setSearchParams]);

  useEffect(() => {
    if (highlightOrderId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`order-row-${highlightOrderId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightOrderId, workOrders]);

  const filteredOrders = workOrders.filter(order => {
    const matchSearch = order.id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.areaName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.assigneeName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleHandle = (order: WorkOrder) => {
    setSelectedOrder(order);
    setHandleResult('');
    setSiteNote('');
    setHandleModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !handleResult.trim()) {
      message.warning('请填写处理结果');
      return;
    }

    handleWorkOrder(selectedOrder.id, { result: handleResult, siteNote });
    message.success('工单已处理');
    setHandleModalVisible(false);
    setSelectedOrder(null);
    setHandleResult('');
    setSiteNote('');
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    const config: Record<string, { color: string; text: string }> = {
      pending: { color: 'warning', text: '待处理' },
      processing: { color: 'processing', text: '处理中' },
      closed: { color: 'success', text: '已关闭' },
    };
    return <Tag color={config[status]?.color || 'default'}>{config[status]?.text || status}</Tag>;
  };

  const columns: ColumnsType<WorkOrder> = [
    {
      title: '工单号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => <span className="font-medium text-primary-700">{text}</span>,
    },
    {
      title: '类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
      render: (text) => (
        <Tag color="warning" className="flex items-center gap-1 m-0">
          <AlertTriangle size={12} />
          {text}
        </Tag>
      ),
    },
    {
      title: '采砂区',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 200,
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      width: 280,
      ellipsis: true,
    },
    {
      title: '指派人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 120,
      render: (text) => (
        <span className="flex items-center gap-1">
          <User size={12} className="text-gray-400" />
          {text}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusBadge(status),
    },
    {
      title: '创建时间',
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
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        record.status === WorkOrderStatus.PENDING && 
        (!isLawEnforcement || record.assignee === currentUserId) ? (
          <button
            onClick={() => handleHandle(record)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
          >
            <MessageSquare size={14} />
            处理
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">工单管理</h2>
            <p className="text-gray-500 text-sm">管理和处置许可超限等异常工单</p>
          </div>
          {isLawEnforcement && (
            <Tag icon={<ShieldCheck size={12} />} color="blue" className="text-sm px-3 py-1">
              执法人员视角：仅显示分配给我的工单
            </Tag>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tag color="warning">
            <AlertTriangle size={12} className="inline mr-1" />
            待处理 {workOrders.filter(w => w.status === WorkOrderStatus.PENDING).length}
          </Tag>
          <Tag color="processing">处理中 {workOrders.filter(w => w.status === WorkOrderStatus.PROCESSING).length}</Tag>
          <Tag color="success">已关闭 {workOrders.filter(w => w.status === WorkOrderStatus.CLOSED).length}</Tag>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <FileText size={20} className="text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{workOrders.length}</div>
              <div className="text-xs text-gray-500">工单总数</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <Clock size={20} className="text-warning-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.status === WorkOrderStatus.PENDING).length}</div>
              <div className="text-xs text-gray-500">待处理</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.status === WorkOrderStatus.PROCESSING).length}</div>
              <div className="text-xs text-gray-500">处理中</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.status === WorkOrderStatus.CLOSED).length}</div>
              <div className="text-xs text-gray-500">已关闭</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索工单号、采砂区、指派人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
              size="middle"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 130 }}
              size="middle"
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待处理' },
                { value: 'processing', label: '处理中' },
                { value: 'closed', label: '已关闭' },
              ]}
            />
            {!isLawEnforcement && (
              <Select
                value={filterAssignee}
                onChange={setFilterAssignee}
                style={{ width: 150 }}
                size="middle"
                options={[
                  { value: 'all', label: '全部执法人员' },
                  ...LAW_ENFORCERS,
                ]}
              />
            )}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          scroll={{ x: 1200 }}
          rowClassName={(record) => record.id === highlightOrderId ? 'bg-primary-50 border-2 border-primary-400' : ''}
          onRow={(record) => ({
            id: `order-row-${record.id}`,
          })}
          pagination={{
            total: filteredOrders.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">问题描述</label>
                    <p className="text-gray-700">{record.description}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">指派人员</label>
                    <p className="text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {record.assigneeName || '未指派'}
                    </p>
                  </div>
                </div>
                
                {record.status === WorkOrderStatus.CLOSED && (
                  <div className="pt-3 border-t border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-success-600" />
                      处理记录
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.handleByName && (
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">处理人</label>
                          <p className="text-gray-700 flex items-center gap-1">
                            <ShieldCheck size={14} className="text-blue-500" />
                            {record.handleByName}
                          </p>
                        </div>
                      )}
                      {record.handleTime && (
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">处理时间</label>
                          <p className="text-gray-700">{new Date(record.handleTime).toLocaleString()}</p>
                        </div>
                      )}
                      {record.handleResult && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 block mb-1">处理结果</label>
                          <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                            {record.handleResult}
                          </p>
                        </div>
                      )}
                      {record.siteNote && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 block mb-1">现场说明</label>
                          <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                            {record.siteNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary-600" />
            <span>处理工单</span>
          </div>
        }
        open={handleModalVisible}
        onCancel={() => setHandleModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">工单号:</span>
                  <span className="ml-1 font-medium text-primary-700">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">类型:</span>
                  <span className="ml-1 font-medium">{selectedOrder.typeName}</span>
                </div>
                <div>
                  <span className="text-gray-500">采砂区:</span>
                  <span className="ml-1 font-medium">{selectedOrder.areaName}</span>
                </div>
                <div>
                  <span className="text-gray-500">指派人:</span>
                  <span className="ml-1 font-medium">{selectedOrder.assigneeName}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-gray-500 text-sm">问题描述:</span>
                <p className="text-gray-700 mt-1">{selectedOrder.description}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                处理结果 <span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                value={handleResult}
                onChange={(e) => setHandleResult(e.target.value)}
                placeholder="请填写处理结果，如：已现场核查，责令限期整改..."
                rows={4}
                maxLength={500}
                showCount
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                现场说明
              </label>
              <Input.TextArea
                value={siteNote}
                onChange={(e) => setSiteNote(e.target.value)}
                placeholder="请填写现场检查情况、取证记录、整改措施等说明..."
                rows={3}
                maxLength={500}
                showCount
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setHandleModalVisible(false)}>
                取消
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                icon={<CheckCircle size={14} />}
              >
                确认处理
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
