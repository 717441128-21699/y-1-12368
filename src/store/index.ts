import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import {
  type User,
  type DashboardMetrics,
  type MiningArea,
  type Warning,
  type MiningPermit,
  type WorkOrder,
  type MiningShip,
  type WeeklyReport,
  type WaterMonitorData,
  type WeighingRecord,
  type ProvinceData,
  type HealthRankItem,
  type TrendData,
  DataScope,
  WorkOrderStatus,
} from '../types';
import {
  mockUser,
  generateDashboardMetrics,
  generateMiningAreas,
  generateWarnings,
  generateMiningPermits,
  generateWorkOrders,
  generateMiningShips,
  generateWeeklyReports,
  generateWaterMonitorData,
  generateWeighingRecords,
  generateProvinceData,
  generateHealthRank,
  generateTrendData,
  generateTransportFlowData,
  generateHeatmapData,
} from '../mock/data';

interface AppState {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  dashboardMetrics: DashboardMetrics | null;
  provinceData: ProvinceData[];
  healthRank: HealthRankItem[];
  trendData: TrendData[];
  
  miningAreas: MiningArea[];
  currentArea: MiningArea | null;
  areaShips: MiningShip[];
  waterMonitorData: WaterMonitorData[];
  weighingRecords: WeighingRecord[];
  heatmapData: [number, number, number][];
  transportFlowData: { destination: string; value: number; percentage: number }[];
  
  warnings: Warning[];
  currentWarning: Warning | null;
  
  permits: MiningPermit[];
  currentPermit: MiningPermit | null;
  
  workOrders: WorkOrder[];
  currentWorkOrder: WorkOrder | null;
  
  weeklyReports: WeeklyReport[];
  
  sidebarCollapsed: boolean;
  selectedProvince: string | null;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  fetchDashboardMetrics: () => void;
  fetchProvinceData: () => void;
  fetchHealthRank: () => void;
  fetchTrendData: () => void;
  
  fetchMiningAreas: (filters?: Partial<MiningArea>) => void;
  selectMiningArea: (id: string | null) => void;
  fetchAreaDetail: (id: string) => void;
  
  fetchWarnings: (filters?: Partial<Warning>) => void;
  selectWarning: (id: string | null) => void;
  approveWarning: (warningId: string, nodeIndex: number, opinion: string, approved: boolean) => void;
  
  fetchPermits: (filters?: Partial<MiningPermit>) => void;
  selectPermit: (id: string | null) => void;
  uploadPermitExcel: (file: File) => Promise<boolean>;
  
  fetchWorkOrders: (filters?: Partial<WorkOrder>) => void;
  selectWorkOrder: (id: string | null) => void;
  handleWorkOrder: (orderId: string, result: string) => void;
  
  fetchWeeklyReports: (areaId?: string) => void;
  
  toggleSidebar: () => void;
  setSelectedProvince: (province: string | null) => void;
  
  updateUser: (userData: Partial<User>) => void;
  
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

let realTimeInterval: NodeJS.Timeout | null = null;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        
        dashboardMetrics: null,
        provinceData: [],
        healthRank: [],
        trendData: [],
        
        miningAreas: [],
        currentArea: null,
        areaShips: [],
        waterMonitorData: [],
        weighingRecords: [],
        heatmapData: [],
        transportFlowData: [],
        
        warnings: [],
        currentWarning: null,
        
        permits: [],
        currentPermit: null,
        
        workOrders: [],
        currentWorkOrder: null,
        
        weeklyReports: [],
        
        sidebarCollapsed: false,
        selectedProvince: null,
        
        login: async (username: string, password: string) => {
          set({ isLoading: true });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (username === 'admin' && password === '123456') {
            set({ user: mockUser, currentUser: mockUser, isAuthenticated: true, isLoading: false });
            return true;
          }
          if (username === 'province' && password === '123456') {
            const userData = { ...mockUser, userId: 'prov001', username: 'province', realName: '省级管理员', role: 'provincial_admin', roleName: '省级管理员', dataScope: DataScope.PROVINCIAL, regionCode: '320000', regionName: '江苏省' };
            set({
              user: userData,
              currentUser: userData,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          if (username === 'county' && password === '123456') {
            const userData = { ...mockUser, userId: 'county001', username: 'county', realName: '县级管理员', role: 'county_admin', roleName: '县级管理员', dataScope: DataScope.COUNTY, regionCode: '320115', regionName: '江苏省南京市江宁区' };
            set({
              user: userData,
              currentUser: userData,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          if (username === 'enterprise' && password === '123456') {
            const userData = { ...mockUser, userId: 'ent001', username: 'enterprise', realName: '企业经办人', role: 'enterprise', roleName: '采砂企业', dataScope: DataScope.ENTERPRISE, regionCode: '320115', regionName: '江苏省南京市江宁区' };
            set({
              user: userData,
              currentUser: userData,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          
          set({ isLoading: false });
          return false;
        },
        
        logout: () => {
          set({ user: null, currentUser: null, isAuthenticated: false });
          get().stopRealTimeUpdates();
        },

        updateUser: (userData) => {
          const current = get().user;
          if (current) {
            const updated = { ...current, ...userData };
            set({ user: updated, currentUser: updated });
          }
        },
        
        fetchDashboardMetrics: () => {
          set({ dashboardMetrics: generateDashboardMetrics() });
        },
        
        fetchProvinceData: () => {
          set({ provinceData: generateProvinceData() });
        },
        
        fetchHealthRank: () => {
          set({ healthRank: generateHealthRank(15) });
        },
        
        fetchTrendData: () => {
          set({ trendData: generateTrendData(30) });
        },
        
        fetchMiningAreas: (filters) => {
          let areas = generateMiningAreas(50);
          if (filters?.province) {
            areas = areas.filter(a => a.province === filters.province);
          }
          if (filters?.status) {
            areas = areas.filter(a => a.status === filters.status);
          }
          set({ miningAreas: areas });
        },
        
        selectMiningArea: (id) => {
          if (!id) {
            set({ currentArea: null });
            return;
          }
          const area = get().miningAreas.find(a => a.id === id) || null;
          set({ currentArea: area });
        },
        
        fetchAreaDetail: (id) => {
          const areas = generateMiningAreas(50);
          const area = areas.find(a => a.id === id) || areas[0];
          const ships = generateMiningShips(area.id, area.center, area.shipCount);
          const waterData = generateWaterMonitorData(48);
          const weighingData = generateWeighingRecords(area.id, 7);
          const transportFlow = generateTransportFlowData(weighingData);
          const heatmap = generateHeatmapData(area.center, 500);
          
          set({
            currentArea: area,
            areaShips: ships,
            waterMonitorData: waterData,
            weighingRecords: weighingData,
            transportFlowData: transportFlow,
            heatmapData: heatmap,
          });
        },
        
        fetchWarnings: (filters) => {
          let warnings = generateWarnings(15);
          if (filters?.status) {
            warnings = warnings.filter(w => w.status === filters.status);
          }
          if (filters?.level) {
            warnings = warnings.filter(w => w.level === filters.level);
          }
          set({ warnings });
        },
        
        selectWarning: (id) => {
          if (!id) {
            set({ currentWarning: null });
            return;
          }
          const warning = get().warnings.find(w => w.id === id) || null;
          set({ currentWarning: warning });
        },
        
        approveWarning: (warningId, nodeIndex, opinion, approved) => {
          const warnings = get().warnings.map(w => {
            if (w.id === warningId) {
              const newFlow = w.approvalFlow.map((node, idx) => {
                if (idx === nodeIndex) {
                  return {
                    ...node,
                    status: approved ? 'approved' as const : 'rejected' as const,
                    operator: get().user?.realName || '未知操作员',
                    operateTime: Date.now(),
                    opinion,
                  };
                }
                return node;
              });
              
              const nextStatus = approved 
                ? nodeIndex === 0 ? 'confirmed' : nodeIndex === 1 ? 'reviewed' : 'approved'
                : 'rejected';
              
              return {
                ...w,
                approvalFlow: newFlow,
                currentNode: approved ? nodeIndex + 1 : nodeIndex,
                status: nextStatus as Warning['status'],
              };
            }
            return w;
          });
          
          set({ warnings });
          const updated = warnings.find(w => w.id === warningId);
          if (get().currentWarning?.id === warningId) {
            set({ currentWarning: updated || null });
          }
        },
        
        fetchPermits: (filters) => {
          let permits = generateMiningPermits(15);
          if (filters?.status) {
            permits = permits.filter(p => p.status === filters.status);
          }
          set({ permits });
        },
        
        selectPermit: (id) => {
          if (!id) {
            set({ currentPermit: null });
            return;
          }
          const permit = get().permits.find(p => p.id === id) || null;
          set({ currentPermit: permit });
        },
        
        uploadPermitExcel: async (file: File) => {
          set({ isLoading: true });
          await new Promise(resolve => setTimeout(resolve, 1500));
          set({ isLoading: false });
          return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        },
        
        fetchWorkOrders: (filters) => {
          let orders = generateWorkOrders(12);
          if (filters?.status) {
            orders = orders.filter(o => o.status === filters.status);
          }
          if (filters?.assignee) {
            orders = orders.filter(o => o.assignee === filters.assignee);
          }
          set({ workOrders: orders });
        },
        
        selectWorkOrder: (id) => {
          if (!id) {
            set({ currentWorkOrder: null });
            return;
          }
          const order = get().workOrders.find(o => o.id === id) || null;
          set({ currentWorkOrder: order });
        },
        
        handleWorkOrder: (orderId, result) => {
          const orders = get().workOrders.map(o => {
            if (o.id === orderId) {
              return {
                ...o,
                status: WorkOrderStatus.CLOSED,
                handleResult: result,
                handleTime: Date.now(),
              };
            }
            return o;
          });
          set({ workOrders: orders });
        },
        
        fetchWeeklyReports: (areaId) => {
          set({ weeklyReports: generateWeeklyReports(areaId, 8) });
        },
        
        toggleSidebar: () => {
          set({ sidebarCollapsed: !get().sidebarCollapsed });
        },
        
        setSelectedProvince: (province) => {
          set({ selectedProvince: province });
        },
        
        startRealTimeUpdates: () => {
          if (realTimeInterval) return;
          
          realTimeInterval = setInterval(() => {
            const currentMetrics = get().dashboardMetrics;
            if (currentMetrics) {
              set({
                dashboardMetrics: {
                  ...currentMetrics,
                  totalSandMining: currentMetrics.totalSandMining + Math.random() * 0.5,
                  overMiningRate: Math.max(0, Math.min(50, currentMetrics.overMiningRate + (Math.random() - 0.5) * 0.5)),
                  healthIndex: Math.max(0, Math.min(100, currentMetrics.healthIndex + (Math.random() - 0.5) * 0.3)),
                },
              });
            }
          }, 5000);
        },
        
        stopRealTimeUpdates: () => {
          if (realTimeInterval) {
            clearInterval(realTimeInterval);
            realTimeInterval = null;
          }
        },
      }),
      {
        name: 'sand-mining-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
);
