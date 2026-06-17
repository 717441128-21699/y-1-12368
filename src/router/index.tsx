import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { MonitorPage } from '../pages/monitor/MonitorPage';
import { MiningAreaListPage } from '../pages/mining-area/MiningAreaListPage';
import { MiningAreaDetailPage } from '../pages/mining-area/MiningAreaDetailPage';
import { WarningListPage } from '../pages/warning/WarningListPage';
import { WarningDetailPage } from '../pages/warning/WarningDetailPage';
import { PermitListPage } from '../pages/permit/PermitListPage';
import { PermitDetailPage } from '../pages/permit/PermitDetailPage';
import { WorkOrderPage } from '../pages/work-order/WorkOrderPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { WeeklyReportPage } from '../pages/reports/WeeklyReportPage';
import { SystemPage } from '../pages/system/SystemPage';
import { Spin } from 'antd';

function RequireAuth() {
  const { isAuthenticated, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/monitor" element={<MonitorPage />} />
          <Route path="/monitor/ship/:id" element={<MonitorPage />} />
          
          <Route path="/mining-area" element={<MiningAreaListPage />} />
          <Route path="/mining-area/:id" element={<MiningAreaDetailPage />} />
          
          <Route path="/warning" element={<WarningListPage />} />
          <Route path="/warning/:id" element={<WarningDetailPage />} />
          
          <Route path="/permit" element={<PermitListPage />} />
          <Route path="/permit/:id" element={<PermitDetailPage />} />
          
          <Route path="/work-order" element={<WorkOrderPage />} />
          
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/weekly" element={<WeeklyReportPage />} />
          
          <Route path="/system" element={<SystemPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
