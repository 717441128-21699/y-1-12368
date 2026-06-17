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
  AreaStatus,
  PermitStatus,
} from '../types';
import { getRandomInRange } from '../utils';
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
  uploadPermitExcel: (file: File) => Promise<{ success: boolean; importedCount: number; newWorkOrderCount: number }>;
  
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

function getCurrentScope(user: User | null) {
  if (!user) return { scope: DataScope.NATIONAL, province: '', city: '', county: '', enterprise: '' };
  
  let province = '';
  let city = '';
  let county = '';
  
  const regionName = user.regionName || '';
  
  if (user.dataScope === DataScope.PROVINCIAL) {
    province = regionName;
  } else if (user.dataScope === DataScope.MUNICIPAL) {
    if (regionName.includes('省')) {
      const parts = regionName.split(/省|自治区/);
      province = parts[0] + (regionName.includes('自治区') ? '自治区' : '省');
      city = parts[1] || regionName;
    } else {
      city = regionName;
    }
  } else if (user.dataScope === DataScope.COUNTY) {
    if (regionName.includes('省')) {
      const provinceEnd = regionName.indexOf('省') !== -1 ? regionName.indexOf('省') + 1 :
                         regionName.indexOf('自治区') !== -1 ? regionName.indexOf('自治区') + 3 : 0;
      province = regionName.substring(0, provinceEnd);
      const rest = regionName.substring(provinceEnd);
      const cityEnd = rest.indexOf('市') !== -1 ? rest.indexOf('市') + 1 : 0;
      city = rest.substring(0, cityEnd);
      county = rest.substring(cityEnd);
    } else {
      county = regionName;
    }
  }
  
  return {
    scope: user.dataScope,
    province,
    city,
    county,
    enterprise: user.dataScope === DataScope.ENTERPRISE ? user.realName : '',
  };
}

function filterAreasByScope(areas: MiningArea[], user: User | null): MiningArea[] {
  const scope = getCurrentScope(user);
  
  if (scope.scope === DataScope.NATIONAL) return areas;
  
  if (scope.scope === DataScope.PROVINCIAL && scope.province) {
    return areas.filter(a => a.province === scope.province);
  }
  
  if (scope.scope === DataScope.MUNICIPAL && scope.city) {
    return areas.filter(a => a.city === scope.city || a.province === scope.city);
  }
  
  if (scope.scope === DataScope.COUNTY && scope.county) {
    return areas.filter(a => a.county === scope.county);
  }
  
  if (scope.scope === DataScope.ENTERPRISE) {
    return areas.filter(a => a.province === '江苏省' && a.city === '南京市').slice(0, 2);
  }
  
  if (scope.scope === DataScope.LAW_ENFORCEMENT) {
    return areas.filter(a => a.status === AreaStatus.WARNING);
  }
  
  return areas;
}

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
          const user = get().user;
          const scope = getCurrentScope(user);
          const allAreas = generateMiningAreas(50);
          const areas = filterAreasByScope(allAreas, user);
          
          if (areas.length === 0) {
            set({ dashboardMetrics: generateDashboardMetrics() });
            return;
          }
          
          const totalSandMining = areas.reduce((sum, a) => sum + a.actualAmount, 0);
          const totalPermitted = areas.reduce((sum, a) => sum + a.permittedAmount, 0);
          const overMiningRate = totalPermitted > 0 
            ? Math.max(0, ((totalSandMining - totalPermitted) / totalPermitted) * 100) 
            : 0;
          const avgHealthIndex = areas.reduce((sum, a) => sum + a.healthIndex, 0) / areas.length;
          const warningAreas = areas.filter(a => a.status === AreaStatus.WARNING).length;
          
          set({
            dashboardMetrics: {
              totalSandMining: Math.round(totalSandMining * 100) / 100,
              overMiningRate: Math.round(overMiningRate * 10) / 10,
              healthIndex: Math.round(avgHealthIndex * 10) / 10,
              complianceRate: Math.round((1 - warningAreas / areas.length) * 100 * 10) / 10,
              activeWarningCount: warningAreas,
              pendingApprovalCount: Math.floor(warningAreas * 0.6),
              yoyGrowth: getRandomInRange(-5, 15, 1),
              momGrowth: getRandomInRange(-3, 10, 1),
            }
          });
        },
        
        fetchProvinceData: () => {
          const user = get().user;
          const scope = getCurrentScope(user);
          const allData = generateProvinceData();
          
          if (scope.scope === DataScope.NATIONAL) {
            set({ provinceData: allData });
            return;
          }
          
          const areas = filterAreasByScope(generateMiningAreas(50), user);
          const provinceSet = new Set(areas.map(a => a.province));
          
          const filtered = allData.filter(p => provinceSet.has(p.name)).map(p => {
            const provinceAreas = areas.filter(a => a.province === p.name);
            const totalActual = provinceAreas.reduce((sum, a) => sum + a.actualAmount, 0);
            const avgHealth = provinceAreas.length > 0 
              ? provinceAreas.reduce((sum, a) => sum + a.healthIndex, 0) / provinceAreas.length 
              : p.healthIndex;
            return { ...p, value: Math.round(totalActual * 100) / 100, healthIndex: Math.round(avgHealth * 10) / 10 };
          });
          
          set({ provinceData: filtered.length > 0 ? filtered : allData.slice(0, 3) });
        },
        
        fetchHealthRank: () => {
          const user = get().user;
          const allAreas = generateMiningAreas(50);
          const areas = filterAreasByScope(allAreas, user);
          
          const sortedAreas = [...areas].sort((a, b) => b.healthIndex - a.healthIndex);
          const rank: HealthRankItem[] = sortedAreas
            .slice(0, Math.min(15, sortedAreas.length))
            .map((a, idx) => {
              const change = getRandomInRange(-5, 5, 1);
              return {
                rank: idx + 1,
                areaName: a.name,
                province: a.province,
                healthIndex: a.healthIndex,
                lastWeekIndex: a.healthIndex - change,
                change,
              };
            });
          
          set({ healthRank: rank });
        },
        
        fetchTrendData: () => {
          set({ trendData: generateTrendData(30) });
        },
        
        fetchMiningAreas: (filters) => {
          let areas = generateMiningAreas(50);
          areas = filterAreasByScope(areas, get().user);
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
          const user = get().user;
          const allAreas = generateMiningAreas(50);
          const filteredAreas = filterAreasByScope(allAreas, user);
          
          let warnings = generateWarnings(Math.max(10, filteredAreas.length / 3), filteredAreas);
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
          const user = get().user;
          const allAreas = generateMiningAreas(50);
          const filteredAreas = filterAreasByScope(allAreas, user);
          
          let permits = generateMiningPermits(Math.max(8, Math.min(15, filteredAreas.length)), filteredAreas);
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
          
          const user = get().user;
          const allAreas = generateMiningAreas(50);
          const filteredAreas = filterAreasByScope(allAreas, user);
          
          const importedPermits: MiningPermit[] = [];
          const newWorkOrders: WorkOrder[] = [];
          
          const importCount = Math.min(5, filteredAreas.length);
          for (let i = 0; i < importCount; i++) {
            const area = filteredAreas[i];
            const permittedAmount = getRandomInRange(100, 400, 2);
            const actualAmount = area.actualAmount;
            const exceedRate = Math.max(0, ((actualAmount - permittedAmount) / permittedAmount) * 100);
            
            let status: PermitStatus = PermitStatus.VALID;
            if (exceedRate >= 10) status = PermitStatus.EXCEEDED;
            
            const permitId = `permit-import-${Date.now()}-${i}`;
            
            const workOrders: WorkOrder[] = [];
            if (exceedRate >= 10) {
              const order: WorkOrder = {
                id: `workorder-import-${Date.now()}-${i}`,
                permitId,
                areaId: area.id,
                areaName: area.name,
                type: 'permit_exceed',
                typeName: '许可超限',
                description: `Excel导入后自动检测：实际采砂量超出许可量${exceedRate.toFixed(1)}%，请执法人员现场核查处置`,
                status: WorkOrderStatus.PENDING,
                assignee: 'law001',
                assigneeName: '执法人员王队',
                createTime: Date.now(),
              };
              workOrders.push(order);
              newWorkOrders.push(order);
            }
            
            importedPermits.push({
              id: permitId,
              permitNo: `采许字[2026]第${3000 + i}号`,
              areaId: area.id,
              areaName: area.name,
              enterprise: `Excel导入企业${i + 1}`,
              permittedAmount,
              actualAmount,
              exceedRate: Math.round(exceedRate * 10) / 10,
              validFrom: '2026-01-01',
              validTo: '2026-12-31',
              status,
              workOrders,
              createTime: Date.now(),
            });
          }
          
          const existingPermits = get().permits;
          const mergedPermits = [...importedPermits, ...existingPermits];
          
          const existingOrders = get().workOrders;
          const mergedOrders = [...newWorkOrders, ...existingOrders];
          
          set({ 
            isLoading: false, 
            permits: mergedPermits,
            workOrders: mergedOrders,
          });
          
          return {
            success: file.name.endsWith('.xlsx') || file.name.endsWith('.xls'),
            importedCount: importedPermits.length,
            newWorkOrderCount: newWorkOrders.length,
          };
        },
        
        fetchWorkOrders: (filters) => {
          const user = get().user;
          const allAreas = generateMiningAreas(50);
          const filteredAreas = filterAreasByScope(allAreas, user);
          
          let orders = generateWorkOrders(Math.max(5, Math.min(12, filteredAreas.length)), filteredAreas);
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
