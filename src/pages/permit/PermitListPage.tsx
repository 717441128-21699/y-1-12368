import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Filter, Eye, FileText, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import { useAppStore } from '../../store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatNumber, formatPercent, getRelativeTime } from '../../utils';
import { PermitStatus, type MiningPermit } from '../../types';
import { Input, Select, Table, Tag, Button, Upload as AntUpload, message, Modal, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';

export function PermitListPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { permits, fetchPermits, uploadPermitExcel, isLoading } = useAppStore();

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  const filteredPermits = permits.filter(permit => {
    const matchSearch = permit.permitNo.toLowerCase().includes(searchText.toLowerCase()) ||
      permit.areaName.toLowerCase().includes(searchText.toLowerCase()) ||
      permit.enterprise.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === 'all' || permit.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleFileUpload = async (file: RcFile) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      message.error('请上传Excel文件（.xlsx或.xls格式）');
      return false;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const result = await uploadPermitExcel(file);
      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        if (result.newWorkOrderCount > 0) {
          message.warning(
            `导入成功：新增${result.importedCount}条许可，检测到${result.newWorkOrderCount}条超量异常，已自动生成工单并推送至执法人员`
          );
        } else {
          message.success(`导入成功：新增${result.importedCount}条许可，所有许可均在正常范围内`);
        }
        setTimeout(() => {
          setUploadModalVisible(false);
          setIsUploading(false);
          setUploadProgress(0);
          fetchPermits();
        }, 1500);
      } else {
        message.error('文件上传失败，请检查文件格式');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(interval);
      message.error('上传过程中发生错误');
      setIsUploading(false);
      setUploadProgress(0);
    }

    return false;
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.download = '采砂许可导入模板.xlsx';
    message.info('正在下载模板文件...');
  };

  const getStatusBadge = (status: PermitStatus) => {
    const config: Record<string, { color: string; text: string }> = {
      valid: { color: 'success', text: '正常' },
      exceeded: { color: 'warning', text: '超限' },
      expired: { color: 'error', text: '已过期' },
    };
    return <Tag color={config[status]?.color || 'default'}>{config[status]?.text || status}</Tag>;
  };

  const columns: ColumnsType<MiningPermit> = [
    {
      title: '许可证号',
      dataIndex: 'permitNo',
      key: 'permitNo',
      width: 180,
      render: (text) => (
        <div className="font-medium text-gray-800">{text}</div>
      ),
    },
    {
      title: '采砂区',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 200,
      render: (text) => <div className="text-gray-700">{text}</div>,
    },
    {
      title: '采砂企业',
      dataIndex: 'enterprise',
      key: 'enterprise',
      width: 180,
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
      title: '超限率',
      dataIndex: 'exceedRate',
      key: 'exceedRate',
      width: 110,
      align: 'right',
      render: (val) => (
        <span className={val > 10 ? 'text-danger-600 font-semibold' : val > 0 ? 'text-warning-600 font-semibold' : 'text-success-600 font-semibold'}>
          {val > 0 ? formatPercent(val, 1) : '-'}
        </span>
      ),
    },
    {
      title: '有效期',
      key: 'validPeriod',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="text-sm text-gray-700">{record.validFrom}</div>
          <div className="text-xs text-gray-400">至 {record.validTo}</div>
        </div>
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
      title: '异常工单',
      dataIndex: 'workOrders',
      key: 'workOrders',
      width: 110,
      align: 'center',
      render: (orders) => (
        <div>
          {orders && orders.length > 0 ? (
            <Tag color="warning" className="flex items-center justify-center gap-1 m-0">
              <AlertTriangle size={12} />
              {orders.length} 条
            </Tag>
          ) : (
            <span className="text-gray-400">-</span>
          )}
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
          onClick={() => navigate(`/permit/${record.id}`)}
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
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">采砂许可管理</h2>
          <p className="text-gray-500 text-sm">管理采砂许可证，支持Excel导入和自动比对</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="btn-outline flex items-center gap-1.5"
          >
            <Download size={16} />
            下载模板
          </button>
          <button
            onClick={() => setUploadModalVisible(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Upload size={16} />
            上传许可
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <FileText size={20} className="text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{permits.length}</div>
              <div className="text-xs text-gray-500">许可总数</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{permits.filter(p => p.status === PermitStatus.VALID).length}</div>
              <div className="text-xs text-gray-500">正常许可</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-warning-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{permits.filter(p => p.status === PermitStatus.EXCEEDED).length}</div>
              <div className="text-xs text-gray-500">超限许可</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
              <XCircle size={20} className="text-danger-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{permits.filter(p => p.status === PermitStatus.EXPIRED).length}</div>
              <div className="text-xs text-gray-500">已过期</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索许可证号、采砂区、企业..."
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
                { value: 'valid', label: '正常' },
                { value: 'exceeded', label: '超限' },
                { value: 'expired', label: '已过期' },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPermits}
          rowKey="id"
          scroll={{ x: 1350 }}
          loading={isLoading}
          pagination={{
            total: filteredPermits.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-primary-600" />
            <span>上传采砂许可Excel</span>
          </div>
        }
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={550}
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">上传说明</h4>
            <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
              <li>支持 .xlsx 和 .xls 格式的Excel文件</li>
              <li>请确保文件包含：许可证号、采砂区、许可量、有效期等字段</li>
              <li>系统将自动提取许可量数据并与实时数据比对</li>
              <li>当实际超量10%时，系统将自动生成异常工单</li>
            </ul>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">上传进度</span>
                <span className="text-primary-600 font-medium">{uploadProgress}%</span>
              </div>
              <Progress percent={uploadProgress} status="active" showInfo={false} />
              <p className="text-xs text-gray-500 text-center">
                {uploadProgress < 100 ? '正在解析Excel数据...' : '数据处理完成！'}
              </p>
            </div>
          )}

          {!isUploading && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file as RcFile);
                }}
              />
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium mb-1">点击或拖拽文件到此处上传</p>
              <p className="text-sm text-gray-400">支持 .xlsx, .xls 格式，最大 10MB</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setUploadModalVisible(false)} disabled={isUploading}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={downloadTemplate}
              icon={<Download size={14} />}
              disabled={isUploading}
            >
              下载模板
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
