import { useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  LayoutDashboard,
  Monitor,
  Mountain,
  AlertTriangle,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  User,
  Building2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';
import { cn } from '../../utils';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sidebarCollapsed, toggleSidebar, warnings, logout } = useAppStore();

  const activeWarningCount = warnings.filter(w => w.status === 'pending' || w.status === 'confirmed' || w.status === 'reviewed').length;

  const menuItems = [
    { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: '首页看板' },
    { key: '/monitor', icon: <Monitor size={18} />, label: '实时监控' },
    { key: '/mining-area', icon: <Mountain size={18} />, label: '采砂区管理' },
    { key: '/warning', icon: <AlertTriangle size={18} />, label: '预警管理' },
    { key: '/permit', icon: <FileText size={18} />, label: '许可管理' },
    { key: '/work-order', icon: <ClipboardList size={18} />, label: '工单管理' },
    { key: '/reports', icon: <BarChart3 size={18} />, label: '统计报表' },
    { key: '/system', icon: <Settings size={18} />, label: '系统管理' },
  ];

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    navigate(key);
  }, [navigate]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人中心',
      onClick: () => navigate('/system'),
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-white/10 transition-colors text-white"
          >
            {sidebarCollapsed ? <MenuIcon size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <Building2 className="text-white" size={28} />
            <div>
              <h1 className="text-white font-serif text-xl font-bold m-0 leading-tight">
                全国河道采砂监管平台
              </h1>
              <p className="text-white/70 text-xs m-0">河道健康智能分析系统</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full">
            <span className="text-white/80 text-sm">{user?.regionName}</span>
          </div>
          
          <button className="relative p-2 rounded hover:bg-white/10 transition-colors text-white">
            <Badge count={activeWarningCount} size="small" offset={[-2, 2]}>
              <Bell size={20} />
            </Badge>
          </button>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-white/10 transition-colors">
              <Avatar 
                size={36} 
                className="bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white/30"
              >
                <User size={18} />
              </Avatar>
              <div className="hidden md:block">
                <p className="text-white text-sm font-medium m-0">{user?.realName}</p>
                <p className="text-white/60 text-xs m-0">{user?.roleName}</p>
              </div>
              <ChevronRight size={14} className="text-white/60 hidden md:block" />
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider
          width={220}
          collapsedWidth={64}
          collapsed={sidebarCollapsed}
          trigger={null}
          className="border-r border-gray-200"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="h-full border-r-0 py-4"
          />
        </Sider>

        <Content className={cn(
          "p-6 overflow-auto",
          "transition-all duration-300"
        )}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
