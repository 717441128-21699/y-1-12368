import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { User, Lock, Building2, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';

interface LoginForm {
  username: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginForm>();
  const { login, isLoading } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error('用户名或密码错误');
      }
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 320" fill="none">
          <path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="text-white" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Waves className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            全国河道采砂监管平台
          </h1>
          <p className="text-white/70">河道健康智能分析系统</p>
        </div>

        <Card
          className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-2xl overflow-hidden"
          bodyStyle={{ padding: '32px' }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            用户登录
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ username: 'admin', password: '123456' }}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                size="large"
                prefix={<User size={18} className="text-gray-400" />}
                placeholder="请输入用户名"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                size="large"
                prefix={<Lock size={18} className="text-gray-400" />}
                placeholder="请输入密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading || isLoading}
                block
                className="h-12 text-base font-medium bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 border-0"
              >
                登 录
              </Button>
            </Form.Item>
          </Form>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">测试账号：</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">国家级管理员</p>
                <p className="text-gray-500">admin / 123456</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">省级管理员</p>
                <p className="text-gray-500">province / 123456</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">县级管理员</p>
                <p className="text-gray-500">county / 123456</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">采砂企业</p>
                <p className="text-gray-500">enterprise / 123456</p>
              </div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">
                <p className="font-medium text-blue-700">执法人员王队</p>
                <p className="text-blue-500">law001 / 123456</p>
              </div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">
                <p className="font-medium text-blue-700">执法人员李队</p>
                <p className="text-blue-500">law002 / 123456</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/50 text-sm flex items-center justify-center gap-1">
            <Building2 size={14} />
            中华人民共和国水利部
          </p>
        </div>
      </div>
    </div>
  );
}
