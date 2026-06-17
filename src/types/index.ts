export enum DataScope {
  NATIONAL = 'national',
  PROVINCIAL = 'provincial',
  MUNICIPAL = 'municipal',
  COUNTY = 'county',
  ENTERPRISE = 'enterprise',
  LAW_ENFORCEMENT = 'law_enforcement',
}

export enum WarningType {
  OVER_MINING = 'over_mining',
  WATER_LEVEL_DROP = 'water_level_drop',
  PERMIT_EXCEED = 'permit_exceed',
}

export enum WarningLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}

export enum WarningStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLOSED = 'closed',
}

export enum ShipStatus {
  MINING = 'mining',
  TRANSPORTING = 'transporting',
  IDLE = 'idle',
}

export enum PermitStatus {
  VALID = 'valid',
  EXCEEDED = 'exceeded',
  EXPIRED = 'expired',
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CLOSED = 'closed',
}

export enum AreaStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  SUSPENDED = 'suspended',
}

export interface MenuPermission {
  menuId: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface User {
  userId: string;
  username: string;
  realName: string;
  role: string;
  roleName: string;
  dataScope: DataScope;
  regionCode: string;
  regionName: string;
  phone?: string;
  email?: string;
  permissions: MenuPermission[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardMetrics {
  totalSandMining: number;
  overMiningRate: number;
  healthIndex: number;
  complianceRate: number;
  activeWarningCount: number;
  pendingApprovalCount: number;
  yoyGrowth: number;
  momGrowth: number;
}

export interface ProvinceData {
  name: string;
  value: number;
  overMiningRate: number;
  healthIndex: number;
  miningAreaCount: number;
}

export interface TrajectoryPoint {
  timestamp: number;
  location: [number, number];
  speed: number;
  heading: number;
  status: string;
}

export interface MiningShip {
  id: string;
  name: string;
  mmsi: string;
  areaId: string;
  enterprise: string;
  currentLocation: [number, number];
  currentStatus: ShipStatus;
  todayOutput: number;
  totalOutput: number;
  lastUpdate: number;
  trajectory?: TrajectoryPoint[];
}

export interface MiningArea {
  id: string;
  name: string;
  province: string;
  city: string;
  county: string;
  regionCode: string;
  center: [number, number];
  boundary: [number, number][];
  permittedAmount: number;
  actualAmount: number;
  overMiningRate: number;
  healthIndex: number;
  status: AreaStatus;
  shipCount: number;
  activeShips: number;
  ships?: MiningShip[];
  createTime: number;
}

export interface WaterMonitorData {
  timestamp: number;
  waterLevel: number;
  flowRate: number;
  dropRate: number;
}

export interface WeighingRecord {
  id: string;
  vehicleNo: string;
  areaId: string;
  areaName: string;
  weight: number;
  destination: string;
  weighTime: number;
  isCompliant: boolean;
}

export interface ApprovalNode {
  id: string;
  nodeIndex: number;
  nodeName: string;
  requireRole: string;
  status: 'pending' | 'approved' | 'rejected';
  operator?: string;
  operateTime?: number;
  opinion?: string;
  attachments?: string[];
}

export interface Warning {
  id: string;
  type: WarningType;
  typeName: string;
  level: WarningLevel;
  areaId: string;
  areaName: string;
  description: string;
  triggerTime: number;
  status: WarningStatus;
  currentNode: number;
  approvalFlow: ApprovalNode[];
  overMiningRate?: number;
  waterDropRate?: number;
}

export interface WorkOrder {
  id: string;
  permitId: string;
  areaId: string;
  areaName: string;
  type: string;
  typeName: string;
  description: string;
  status: WorkOrderStatus;
  assignee?: string;
  assigneeName?: string;
  createTime: number;
  handleTime?: number;
  handleResult?: string;
}

export interface MiningPermit {
  id: string;
  permitNo: string;
  areaId: string;
  areaName: string;
  enterprise: string;
  permittedAmount: number;
  actualAmount: number;
  exceedRate: number;
  validFrom: string;
  validTo: string;
  status: PermitStatus;
  workOrders: WorkOrder[];
  createTime: number;
}

export interface WeeklyReport {
  id: string;
  areaId?: string;
  areaName?: string;
  reportDate: string;
  sandMiningAmount: number;
  sandMiningYoy: number;
  sandMiningMom: number;
  overMiningEvents: number;
  healthIndex: number;
  healthIndexMom: number;
  siltationAssessment: string;
  recommendations: string;
  createTime: number;
}

export interface HeatmapPoint {
  lng: number;
  lat: number;
  count: number;
}

export interface TransportFlowData {
  destination: string;
  value: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  value: number;
  target?: number;
}

export interface HealthRankItem {
  rank: number;
  areaName: string;
  province: string;
  healthIndex: number;
  lastWeekIndex: number;
  change: number;
}

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  meta?: {
    title: string;
    icon?: React.ReactNode;
    requiresAuth?: boolean;
    allowedRoles?: string[];
  };
  children?: RouteConfig[];
}
