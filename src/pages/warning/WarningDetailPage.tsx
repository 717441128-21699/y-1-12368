import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Clock, MapPin, User, CheckCircle, XCircle,
  Clock3, FileText, Mountain, Droplets, Send, Lock
} from 'lucide-react';
import { useAppStore } from '../../store';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getWarningLevelText, getRelativeTime, formatPercent } from '../../utils';
import { WarningLevel, WarningStatus, WarningType } from '../../types';
import { Spin, Modal, Input, Button, message } from 'antd';

const { TextArea } = Input;

export function WarningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [opinion, setOpinion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentWarning,
    user,
    fetchWarnings,
    selectWarning,
    approveWarning,
  } = useAppStore();

  useEffect(() => {
    if (id) {
      fetchWarnings();
      selectWarning(id);
    }
    return () => selectWarning(null);
  }, [id, fetchWarnings, selectWarning]);

  if (!currentWarning) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const currentNode = currentWarning.approvalFlow[currentWarning.currentNode];
  const isFlowActive = currentNode && currentWarning.currentNode < currentWarning.approvalFlow.length &&
    currentWarning.status !== WarningStatus.APPROVED &&
    currentWarning.status !== WarningStatus.REJECTED &&
    currentWarning.status !== WarningStatus.CLOSED;

  const userRole = user?.role || '';
  const canApproveCurrentNode = isFlowActive && (
    userRole === 'national_admin' ||
    userRole === currentNode?.requireRole ||
    (currentNode?.requireRole === 'enterprise' && userRole === 'enterprise') ||
    (currentNode?.requireRole === 'county_admin' && userRole === 'county_admin') ||
    (currentNode?.requireRole === 'provincial_admin' && userRole === 'provincial_admin')
  );

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      'enterprise': '采砂企业',
      'county_admin': '县级水利局',
      'provincial_admin': '省级河长办',
      'national_admin': '国家级管理员',
    };
    return roleMap[role] || role;
  };

  const handleApprove = async () => {
    if (!opinion.trim()) {
      message.warning('请填写审批意见');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    approveWarning(currentWarning.id, currentWarning.currentNode, opinion, true);
    setIsSubmitting(false);
    setApprovalModalVisible(false);
    setOpinion('');
    message.success('审批通过');
  };

  const handleReject = async () => {
    if (!opinion.trim()) {
      message.warning('请填写驳回理由');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    approveWarning(currentWarning.id, currentWarning.currentNode, opinion, false);
    setIsSubmitting(false);
    setRejectionModalVisible(false);
    setOpinion('');
    message.success('已驳回');
  };

  const getLevelStyle = (level: WarningLevel) => {
    const styles: Record<number, { bg: string; text: string; border: string; animation?: string }> = {
      1: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', animation: 'animate-pulse' },
      2: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      3: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    };
    return styles[level] || styles[3];
  };

  const levelStyle = getLevelStyle(currentWarning.level);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/warning')}
            className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回列表</span>
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">预警详情</h2>
            <p className="text-gray-500 text-sm mt-1">预警编号: {currentWarning.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canApproveCurrentNode ? (
            <>
              <button
                onClick={() => setRejectionModalVisible(true)}
                className="btn-danger flex items-center gap-1.5"
              >
                <XCircle size={16} />
                驳回
              </button>
              <button
                onClick={() => setApprovalModalVisible(true)}
                className="btn-success flex items-center gap-1.5"
              >
                <CheckCircle size={16} />
                通过
              </button>
            </>
          ) : isFlowActive ? (
            <div className="text-sm text-gray-500 flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Lock size={14} />
              当前节点需由「{currentNode ? getRoleName(currentNode.requireRole) : '-'}」处理
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`card p-5 border-l-4 ${levelStyle.border}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${levelStyle.bg} flex items-center justify-center ${levelStyle.animation || ''}`}>
                  <AlertTriangle size={24} className={levelStyle.text} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{currentWarning.areaName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${levelStyle.bg} ${levelStyle.text}`}>
                      {getWarningLevelText(currentWarning.level)}
                    </span>
                    <StatusBadge status={currentWarning.status as any} />
                  </div>
                  <p className="text-gray-600">{currentWarning.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      触发时间: {getRelativeTime(currentWarning.triggerTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {currentWarning.areaName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentWarning.type === WarningType.OVER_MINING && currentWarning.overMiningRate !== undefined && (
                <div className="p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                    <Mountain size={16} />
                    超采率
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {formatPercent(currentWarning.overMiningRate, 1)}
                  </div>
                  <div className="text-xs text-red-500 mt-0.5">阈值: 30%</div>
                </div>
              )}
              {currentWarning.type === WarningType.WATER_LEVEL_DROP && currentWarning.waterDropRate !== undefined && (
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
                    <Droplets size={16} />
                    水位下降速率
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {currentWarning.waterDropRate.toFixed(3)} m/h
                  </div>
                  <div className="text-xs text-orange-500 mt-0.5">阈值: 0.5 m/h</div>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <FileText size={16} />
                  预警类型
                </div>
                <div className="text-xl font-bold text-gray-800">{currentWarning.typeName}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
                  <User size={16} />
                  当前审批
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {currentNode?.nodeName || '已完成'}
                </div>
                <div className="text-xs text-blue-500 mt-0.5">
                  第 {Math.min(currentWarning.currentNode + 1, currentWarning.approvalFlow.length)} / {currentWarning.approvalFlow.length} 节点
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">三级审批流程</h3>
            <div className="relative">
              {currentWarning.approvalFlow.map((node, index) => {
                const isCompleted = node.status === 'approved' || node.status === 'rejected';
                const isCurrent = index === currentWarning.currentNode && !isCompleted;
                const isRejected = node.status === 'rejected';

                return (
                  <div key={node.id} className="relative pb-8 last:pb-0">
                    {index < currentWarning.approvalFlow.length - 1 && (
                      <div className={`absolute left-5 top-10 w-0.5 h-full ${
                        isCompleted ? 'bg-success-500' : 'bg-gray-200'
                      }`} />
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                        isRejected ? 'bg-danger-500' :
                        isCompleted ? 'bg-success-500' :
                        isCurrent ? 'bg-primary-500 ring-4 ring-primary-100' :
                        'bg-gray-200'
                      }`}>
                        {isRejected ? (
                          <XCircle size={20} className="text-white" />
                        ) : isCompleted ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : isCurrent ? (
                          <Clock3 size={20} className="text-white animate-pulse" />
                        ) : (
                          <Clock size={20} className="text-gray-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${
                            isRejected ? 'text-danger-600' :
                            isCompleted ? 'text-success-700' :
                            isCurrent ? 'text-primary-700' :
                            'text-gray-500'
                          }`}>
                            {node.nodeName}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full animate-pulse">
                              待处理
                            </span>
                          )}
                          {isCompleted && !isRejected && (
                            <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs rounded-full">
                              已通过
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 bg-danger-100 text-danger-700 text-xs rounded-full">
                              已驳回
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          需要角色: <span className="font-medium text-gray-700">{node.requireRole}</span>
                        </div>

                        {node.opinion && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">{node.operator}</span>
                              </div>
                              {node.operateTime && (
                                <span className="text-xs text-gray-400">
                                  {new Date(node.operateTime).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{node.opinion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentWarning.status === WarningStatus.APPROVED && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-green-800">审批流程已完成</h4>
                  <p className="text-green-600 text-sm mt-0.5">
                    已批准对该采砂区采取限采或停采措施，请相关部门立即执行
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentWarning.status === WarningStatus.REJECTED && (
            <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-red-800">审批已驳回</h4>
                  <p className="text-red-600 text-sm mt-0.5">
                    预警已被驳回，请查看审批意见了解详情
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="section-title mb-4">采砂区信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">采砂区名称</span>
                <span className="font-medium text-gray-800">{currentWarning.areaName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">预警类型</span>
                <span className="font-medium text-gray-800">{currentWarning.typeName}</span>
              </div>
              {currentWarning.overMiningRate !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">超采率</span>
                  <span className="font-semibold text-red-600">{formatPercent(currentWarning.overMiningRate, 1)}</span>
                </div>
              )}
              {currentWarning.waterDropRate !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">水位下降速率</span>
                  <span className="font-semibold text-orange-600">{currentWarning.waterDropRate.toFixed(3)} m/h</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">触发时间</span>
                <span className="font-medium text-gray-800">{new Date(currentWarning.triggerTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">当前状态</span>
                <StatusBadge status={currentWarning.status as any} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">处置建议</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg">
                <AlertTriangle size={18} className="text-warning-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-warning-800 text-sm">立即核查</div>
                  <p className="text-xs text-warning-600 mt-0.5">请采砂企业立即核实采砂量数据，确认是否存在超采行为</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <CheckCircle size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-primary-800 text-sm">限制开采</div>
                  <p className="text-xs text-primary-600 mt-0.5">建议暂停部分采砂船作业，控制日开采量在许可范围内</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-success-50 rounded-lg">
                <Droplets size={18} className="text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-success-800 text-sm">生态监测</div>
                  <p className="text-xs text-success-600 mt-0.5">加强水情和生态监测，评估采砂对河道生态的影响</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-success-600" />
            <span>通过审批</span>
          </div>
        }
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="p-4 bg-success-50 rounded-lg border border-success-100">
            <div className="font-medium text-success-800">
              即将通过: {currentNode?.nodeName}
            </div>
            <div className="text-sm text-success-600 mt-1">
              通过后将进入下一审批节点
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              审批意见 <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="请填写审批意见..."
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setApprovalModalVisible(false)}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleApprove}
              loading={isSubmitting}
              icon={<Send size={14} />}
              className="bg-success-600 hover:bg-success-700"
            >
              确认通过
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-danger-600" />
            <span>驳回申请</span>
          </div>
        }
        open={rejectionModalVisible}
        onCancel={() => setRejectionModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="p-4 bg-danger-50 rounded-lg border border-danger-100">
            <div className="font-medium text-danger-800">
              即将驳回: {currentNode?.nodeName}
            </div>
            <div className="text-sm text-danger-600 mt-1">
              驳回后整个审批流程将终止，请谨慎操作
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              驳回理由 <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="请填写驳回理由..."
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setRejectionModalVisible(false)}>
              取消
            </Button>
            <Button
              danger
              onClick={handleReject}
              loading={isSubmitting}
              icon={<XCircle size={14} />}
            >
              确认驳回
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
