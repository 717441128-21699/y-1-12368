import { useState } from 'react';
import {
  Users, Shield, Settings, UserCircle, Bell, Lock, Eye,
  Edit, Trash2, Plus, Search, Save, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { useAppStore } from '../../store';
import { Table, Button, Modal, Form, Input, Select, Tag, Switch, message, Tabs, InputNumber, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DataScope } from '../../types';

type SystemTab = 'users' | 'roles' | 'thresholds' | 'profile';

const mockUsers = [
  { id: 1, username: 'admin', name: '国家管理员', role: '国家级管理员', dataScope: DataScope.NATIONAL, phone: '138****0001', email: 'admin@river.gov.cn', status: true },
  { id: 2, username: 'hubei_admin', name: '张伟', role: '省级管理员', dataScope: DataScope.PROVINCIAL, province: '湖北省', phone: '138****0002', email: 'hubei@river.gov.cn', status: true },
  { id: 3, username: 'hunan_admin', name: '李芳', role: '省级管理员', dataScope: DataScope.PROVINCIAL, province: '湖南省', phone: '138****0003', email: 'hunan@river.gov.cn', status: true },
  { id: 4, username: 'wuhan_admin', name: '王强', role: '市级管理员', dataScope: DataScope.MUNICIPAL, province: '湖北省', city: '武汉市', phone: '138****0004', email: 'wuhan@river.gov.cn', status: true },
  { id: 5, username: 'enterprise_01', name: '陈刚', role: '采砂企业', dataScope: DataScope.ENTERPRISE, province: '湖北省', enterprise: '武汉砂石有限公司', phone: '139****0001', email: 'chengang@sand.com', status: true },
  { id: 6, username: 'law_01', name: '刘洋', role: '执法人员', dataScope: DataScope.MUNICIPAL, province: '湖北省', city: '武汉市', phone: '137****0001', email: 'liuyang@law.gov.cn', status: true },
  { id: 7, username: 'county_admin', name: '赵平', role: '县级管理员', dataScope: DataScope.COUNTY, province: '湖北省', city: '武汉市', county: '洪山区', phone: '138****0005', email: 'zhaoping@river.gov.cn', status: true },
  { id: 8, username: 'enterprise_02', name: '孙明', role: '采砂企业', dataScope: DataScope.ENTERPRISE, province: '湖南省', enterprise: '长沙砂石公司', phone: '139****0002', email: 'sunming@sand.com', status: false },
];

const mockRoles = [
  { id: 1, name: '国家级管理员', code: 'country_admin', description: '拥有全国范围所有功能权限', userCount: 2, status: true },
  { id: 2, name: '省级管理员', code: 'province_admin', description: '拥有本省范围所有功能权限', userCount: 15, status: true },
  { id: 3, name: '市级管理员', code: 'city_admin', description: '拥有本市范围所有功能权限', userCount: 86, status: true },
  { id: 4, name: '县级管理员', code: 'county_admin', description: '拥有本县范围所有功能权限', userCount: 342, status: true },
  { id: 5, name: '采砂企业', code: 'enterprise', description: '可查看本企业采砂数据、处理预警', userCount: 1258, status: true },
  { id: 6, name: '执法人员', code: 'law_enforcement', description: '可接收工单、处理超采问题', userCount: 526, status: true },
];

export function SystemPage() {
  const [activeTab, setActiveTab] = useState<SystemTab>('users');
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [thresholdForm] = Form.useForm();
  const [profileForm] = Form.useForm();

  const { currentUser, updateUser } = useAppStore();

  const [thresholds, setThresholds] = useState([
    { id: 1, name: '超采预警阈值', key: 'overMiningRate', value: 30, unit: '%', description: '采砂量超过许可量的百分比' },
    { id: 2, name: '水位下降速率阈值', key: 'waterDropRate', value: 0.5, unit: 'm/h', description: '每小时水位下降速率' },
    { id: 3, name: '异常工单阈值', key: 'workOrderThreshold', value: 10, unit: '%', description: '采砂量超许可比例触发工单' },
    { id: 4, name: '连续监测时长', key: 'monitoringDuration', value: 12, unit: '小时', description: '连续超采预警监测时长' },
    { id: 5, name: '健康指数优秀阈值', key: 'healthExcellent', value: 90, unit: '分', description: '河道健康指数优秀标准' },
    { id: 6, name: '健康指数预警阈值', key: 'healthWarning', value: 60, unit: '分', description: '河道健康指数预警标准' },
  ]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.includes(searchText) || user.username.includes(searchText)
  );

  const userColumns: ColumnsType<typeof mockUsers[0]> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (text) => (
        <Tag color="blue" className="m-0">{text}</Tag>
      ),
    },
    {
      title: '数据范围',
      dataIndex: 'dataScope',
      key: 'dataScope',
      width: 180,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.province && <span>{record.province}</span>}
          {record.city && <span> / {record.city}</span>}
          {record.county && <span> / {record.county}</span>}
          {record.enterprise && <span className="text-primary-600">{record.enterprise}</span>}
          {record.dataScope === DataScope.NATIONAL && <span className="text-primary-600">全国</span>}
        </div>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (val) => (
        <span className={val ? 'text-success-600' : 'text-gray-400'}>
          {val ? '正常' : '禁用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="text-primary-600 hover:text-primary-700"
            onClick={() => {
              userForm.setFieldsValue(record);
              setUserModalVisible(true);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-gray-500 hover:text-gray-700"
            title="查看"
          >
            <Eye size={16} />
          </button>
          <button
            className="text-danger-600 hover:text-danger-700"
            onClick={() => message.warning('此为演示数据，不允许删除')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const roleColumns: ColumnsType<typeof mockRoles[0]> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (text) => <code className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-xs">{text}</code>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      align: 'right',
      render: (val) => <span className="font-semibold text-primary-600">{val}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (val) => (
        val ? <Tag color="success" className="m-0">启用</Tag> : <Tag color="default" className="m-0">禁用</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="text-primary-600 hover:text-primary-700"
            onClick={() => {
              roleForm.setFieldsValue(record);
              setRoleModalVisible(true);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-gray-500 hover:text-gray-700"
            title="权限配置"
          >
            <Shield size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleUserSubmit = async (values: any) => {
    message.success('用户信息已更新');
    setUserModalVisible(false);
  };

  const handleRoleSubmit = async (values: any) => {
    message.success('角色信息已更新');
    setRoleModalVisible(false);
  };

  const handleThresholdSubmit = async (values: any) => {
    setThresholds(prev => prev.map(t =>
      t.key === values.key ? { ...t, value: values.value } : t
    ));
    message.success('阈值配置已更新');
    setThresholdModalVisible(false);
  };

  const handleProfileSubmit = async (values: any) => {
    if (currentUser) {
      updateUser({
        ...currentUser,
        realName: values.name,
        phone: values.phone,
        email: values.email,
      });
      message.success('个人信息已更新');
    }
    setProfileModalVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">系统管理</h2>
          <p className="text-gray-500 text-sm">管理用户、角色和系统配置</p>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as SystemTab)}
        items={[
          {
            key: 'users',
            label: (
              <span className="flex items-center gap-1.5">
                <Users size={16} />
                用户管理
              </span>
            ),
            children: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="搜索用户名或姓名"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button type="primary" icon={<Plus size={14} />}>
                    新增用户
                  </Button>
                </div>
                <Card className="p-0">
                  <Table
                    columns={userColumns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    scroll={{ x: 1100 }}
                    pagination={{
                      total: filteredUsers.length,
                      pageSize: 10,
                      showSizeChanger: true,
                    }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'roles',
            label: (
              <span className="flex items-center gap-1.5">
                <Shield size={16} />
                角色管理
              </span>
            ),
            children: (
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <Button type="primary" icon={<Plus size={14} />}>
                    新增角色
                  </Button>
                </div>
                <Card className="p-0">
                  <Table
                    columns={roleColumns}
                    dataSource={mockRoles}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'thresholds',
            label: (
              <span className="flex items-center gap-1.5">
                <Settings size={16} />
                阈值配置
              </span>
            ),
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {thresholds.map((threshold) => (
                  <div key={threshold.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{threshold.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{threshold.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          thresholdForm.setFieldsValue(threshold);
                          setThresholdModalVisible(true);
                        }}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary-600">{threshold.value}</span>
                      <span className="text-gray-500 text-sm">{threshold.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'profile',
            label: (
              <span className="flex items-center gap-1.5">
                <UserCircle size={16} />
                个人中心
              </span>
            ),
            children: currentUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-white">{currentUser.realName.charAt(0)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{currentUser.realName}</h3>
                    <Tag color="blue" className="mt-2">{currentUser.roleName}</Tag>
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>数据范围</span>
                        <span className="font-medium text-gray-800">{currentUser.regionName || '全国'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>用户名</span>
                        <span className="font-medium text-gray-800">{currentUser.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>联系电话</span>
                        <span className="font-medium text-gray-800">{currentUser.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>邮箱</span>
                        <span className="font-medium text-gray-800">{currentUser.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        profileForm.setFieldsValue({
                          name: currentUser.realName,
                          phone: currentUser.phone,
                          email: currentUser.email,
                        });
                        setProfileModalVisible(true);
                      }}
                      className="w-full mt-4 btn-outline flex items-center justify-center gap-1.5"
                    >
                      <Edit size={14} />
                      编辑资料
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="card p-5">
                    <h3 className="section-title mb-4 flex items-center gap-2">
                      <Bell size={18} className="text-primary-600" />
                      通知设置
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: '超采预警通知', desc: '接收采砂超采预警推送', checked: true },
                        { name: '水位异常通知', desc: '接收水位异常下降推送', checked: true },
                        { name: '工单通知', desc: '接收待处理工单推送', checked: true },
                        { name: '周报通知', desc: '接收周度诊断报告通知', checked: true },
                        { name: '系统公告', desc: '接收系统维护和升级通知', checked: false },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.desc}</div>
                          </div>
                          <Switch defaultChecked={item.checked} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="section-title mb-4 flex items-center gap-2">
                      <Lock size={18} className="text-primary-600" />
                      安全设置
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">登录密码</div>
                            <div className="text-xs text-gray-500">上次修改: 30天前</div>
                          </div>
                        </div>
                        <Button size="small">修改密码</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Shield size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">双因素认证</div>
                            <div className="text-xs text-gray-500">建议开启以增强账户安全</div>
                          </div>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null,
          },
        ]}
      />

      <Modal
        title="编辑用户"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="手机号">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input />
            </Form.Item>
            <Form.Item name="role" label="角色" rules={[{ required: true }]}>
              <Select
                options={mockRoles.map(r => ({ value: r.name, label: r.name }))}
              />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setUserModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="编辑角色"
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleSubmit}
        >
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setRoleModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="编辑阈值"
        open={thresholdModalVisible}
        onCancel={() => setThresholdModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={thresholdForm}
          layout="vertical"
          onFinish={handleThresholdSubmit}
        >
          <Form.Item name="name" label="阈值名称">
            <Input disabled />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} disabled />
          </Form.Item>
          <Form.Item name="value" label="阈值" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} step={0.1} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input disabled />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setThresholdModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="编辑个人资料"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSubmit}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setProfileModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
