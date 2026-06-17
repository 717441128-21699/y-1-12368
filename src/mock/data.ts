import {
  DataScope,
  WarningType,
  WarningLevel,
  WarningStatus,
  ShipStatus,
  PermitStatus,
  WorkOrderStatus,
  AreaStatus,
  type User,
  type DashboardMetrics,
  type ProvinceData,
  type MiningArea,
  type MiningShip,
  type Warning,
  type MiningPermit,
  type WorkOrder,
  type WeeklyReport,
  type WaterMonitorData,
  type WeighingRecord,
  type TrajectoryPoint,
  type TransportFlowData,
  type HealthRankItem,
  type TrendData,
} from '../types';
import { getRandomInRange, generateId } from '../utils';

const provinces = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
  '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
  '海南省', '重庆市', '四川省', '贵州省', '云南省',
  '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
  '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区', '台湾省',
];

const cities = ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '南通市', '扬州市', '泰州市'];
const counties = ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区'];

export const mockUser: User = {
  userId: 'admin001',
  username: 'admin',
  realName: '系统管理员',
  role: 'national_admin',
  roleName: '国家级管理员',
  dataScope: DataScope.NATIONAL,
  regionCode: '100000',
  regionName: '全国',
  phone: '13800138000',
  email: 'admin@mwr.gov.cn',
  permissions: [
    { menuId: 'dashboard', canView: true, canEdit: false, canDelete: false, canApprove: false },
    { menuId: 'monitor', canView: true, canEdit: false, canDelete: false, canApprove: false },
    { menuId: 'mining-area', canView: true, canEdit: true, canDelete: true, canApprove: false },
    { menuId: 'warning', canView: true, canEdit: true, canDelete: false, canApprove: true },
    { menuId: 'permit', canView: true, canEdit: true, canDelete: true, canApprove: true },
    { menuId: 'work-order', canView: true, canEdit: true, canDelete: false, canApprove: false },
    { menuId: 'reports', canView: true, canEdit: false, canDelete: false, canApprove: false },
    { menuId: 'system', canView: true, canEdit: true, canDelete: true, canApprove: true },
  ],
};

export function generateDashboardMetrics(): DashboardMetrics {
  return {
    totalSandMining: getRandomInRange(800, 1500, 2),
    overMiningRate: getRandomInRange(5, 25, 1),
    healthIndex: getRandomInRange(70, 95, 1),
    complianceRate: getRandomInRange(85, 98, 1),
    activeWarningCount: Math.floor(getRandomInRange(3, 12, 0)),
    pendingApprovalCount: Math.floor(getRandomInRange(2, 8, 0)),
    yoyGrowth: getRandomInRange(-5, 15, 1),
    momGrowth: getRandomInRange(-3, 10, 1),
  };
}

export function generateProvinceData(): ProvinceData[] {
  return provinces.map((name, index) => ({
    name,
    value: getRandomInRange(10, 100, 2),
    overMiningRate: getRandomInRange(0, 35, 1),
    healthIndex: getRandomInRange(60, 95, 1),
    miningAreaCount: Math.floor(getRandomInRange(2, 8, 0)),
  }));
}

function generateCenter(): [number, number] {
  return [getRandomInRange(73, 135, 6), getRandomInRange(18, 53, 6)];
}

function generateBoundary(center: [number, number]): [number, number][] {
  const [lng, lat] = center;
  const offset = 0.05;
  return [
    [lng - offset, lat - offset],
    [lng + offset, lat - offset],
    [lng + offset, lat + offset],
    [lng - offset, lat + offset],
    [lng - offset, lat - offset],
  ];
}

export function generateMiningAreas(count = 50): MiningArea[] {
  const areas: MiningArea[] = [];
  
  const fixedAreas = [
    { province: '江苏省', city: '南京市', county: '江宁区' },
    { province: '江苏省', city: '南京市', county: '江宁区' },
    { province: '江苏省', city: '南京市', county: '鼓楼区' },
    { province: '江苏省', city: '苏州市', county: '姑苏区' },
    { province: '江苏省', city: '无锡市', county: '滨湖区' },
    { province: '湖北省', city: '武汉市', county: '洪山区' },
    { province: '湖北省', city: '武汉市', county: '武昌区' },
    { province: '湖南省', city: '长沙市', county: '岳麓区' },
  ];
  
  for (let i = 0; i < count; i++) {
    let province, city, county;
    if (i < fixedAreas.length) {
      province = fixedAreas[i].province;
      city = fixedAreas[i].city;
      county = fixedAreas[i].county;
    } else {
      province = provinces[Math.floor(Math.random() * provinces.length)];
      city = cities[Math.floor(Math.random() * cities.length)];
      county = counties[Math.floor(Math.random() * counties.length)];
    }
    
    const center = generateCenter();
    const permittedAmount = getRandomInRange(50, 500, 2);
    const actualAmount = getRandomInRange(permittedAmount * 0.7, permittedAmount * 1.4, 2);
    const overMiningRate = Math.max(0, ((actualAmount - permittedAmount) / permittedAmount) * 100);
    const healthIndex = getRandomInRange(55, 95, 1);
    
    let status: AreaStatus = AreaStatus.NORMAL;
    if (overMiningRate > 30 || healthIndex < 60) {
      status = AreaStatus.WARNING;
    }
    
    areas.push({
      id: `area-${i + 1}`,
      name: `${province}${city}采砂区${i + 1}号`,
      province,
      city,
      county,
      regionCode: `${100000 + i}`,
      center,
      boundary: generateBoundary(center),
      permittedAmount,
      actualAmount,
      overMiningRate: Math.round(overMiningRate * 10) / 10,
      healthIndex,
      status,
      shipCount: Math.floor(getRandomInRange(3, 10, 0)),
      activeShips: Math.floor(getRandomInRange(1, 8, 0)),
      createTime: Date.now() - getRandomInRange(0, 365 * 24 * 60 * 60 * 1000, 0),
    });
  }
  return areas;
}

function generateTrajectory(center: [number, number], days = 7): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const now = Date.now();
  const interval = 30 * 60 * 1000;
  const totalPoints = (days * 24 * 60 * 60 * 1000) / interval;
  
  let [lng, lat] = center;
  for (let i = 0; i < totalPoints; i++) {
    const timestamp = now - i * interval;
    const statuses = ['mining', 'transporting', 'idle'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    lng += getRandomInRange(-0.002, 0.002, 6);
    lat += getRandomInRange(-0.002, 0.002, 6);
    
    points.push({
      timestamp,
      location: [lng, lat],
      speed: status === 'idle' ? 0 : getRandomInRange(2, 15, 1),
      heading: getRandomInRange(0, 360, 0),
      status,
    });
  }
  
  return points.reverse();
}

export function generateMiningShips(areaId: string, areaCenter: [number, number], count = 5): MiningShip[] {
  const ships: MiningShip[] = [];
  const statuses = [ShipStatus.MINING, ShipStatus.TRANSPORTING, ShipStatus.IDLE];
  const enterprises = ['长江砂石集团', '黄河河道工程', '珠江采砂公司', '淮河建材', '海河砂石'];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const offset: [number, number] = [
      areaCenter[0] + getRandomInRange(-0.03, 0.03, 6),
      areaCenter[1] + getRandomInRange(-0.03, 0.03, 6),
    ];
    
    ships.push({
      id: `ship-${areaId}-${i + 1}`,
      name: `采砂船${i + 1}号`,
      mmsi: `413${Math.floor(getRandomInRange(1000000, 9999999, 0))}`,
      areaId,
      enterprise: enterprises[Math.floor(Math.random() * enterprises.length)],
      currentLocation: offset,
      currentStatus: status,
      todayOutput: status === ShipStatus.MINING ? getRandomInRange(50, 200, 2) : 0,
      totalOutput: getRandomInRange(5000, 50000, 2),
      lastUpdate: Date.now() - getRandomInRange(0, 30 * 60 * 1000, 0),
      trajectory: generateTrajectory(areaCenter),
    });
  }
  
  return ships;
}

export function generateWarnings(count = 10, miningAreas?: MiningArea[]): Warning[] {
  const warnings: Warning[] = [];
  const types = [WarningType.OVER_MINING, WarningType.WATER_LEVEL_DROP, WarningType.PERMIT_EXCEED];
  const statuses = [WarningStatus.PENDING, WarningStatus.CONFIRMED, WarningStatus.REVIEWED, WarningStatus.APPROVED, WarningStatus.CLOSED];
  
  const areas = miningAreas || generateMiningAreas(20);
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const level = Math.random() > 0.7 ? WarningLevel.LEVEL_1 : Math.random() > 0.5 ? WarningLevel.LEVEL_2 : WarningLevel.LEVEL_3;
    const area = areas[Math.floor(Math.random() * areas.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const currentNode = status === WarningStatus.PENDING ? 0 : status === WarningStatus.CONFIRMED ? 1 : status === WarningStatus.REVIEWED ? 2 : 3;
    
    const approvalFlow = [
      {
        id: generateId(),
        nodeIndex: 0,
        nodeName: '采砂企业确认',
        requireRole: 'enterprise',
        status: currentNode >= 1 ? 'approved' as const : 'pending' as const,
        operator: currentNode >= 1 ? '企业经办人' : undefined,
        operateTime: currentNode >= 1 ? Date.now() - 3600000 * 2 : undefined,
        opinion: currentNode >= 1 ? '情况属实，同意上报' : undefined,
      },
      {
        id: generateId(),
        nodeIndex: 1,
        nodeName: '县级水利局复核',
        requireRole: 'county_admin',
        status: currentNode >= 2 ? 'approved' as const : 'pending' as const,
        operator: currentNode >= 2 ? '县级水利局张工' : undefined,
        operateTime: currentNode >= 2 ? Date.now() - 3600000 * 1 : undefined,
        opinion: currentNode >= 2 ? '复核通过，建议启动限采措施' : undefined,
      },
      {
        id: generateId(),
        nodeIndex: 2,
        nodeName: '省级河长办批准',
        requireRole: 'provincial_admin',
        status: currentNode >= 3 ? 'approved' as const : 'pending' as const,
        operator: currentNode >= 3 ? '省级河长办李主任' : undefined,
        operateTime: currentNode >= 3 ? Date.now() - 1800000 : undefined,
        opinion: currentNode >= 3 ? '批准启动限采措施，限期30天整改' : undefined,
      },
    ];
    
    warnings.push({
      id: `warning-${i + 1}`,
      type,
      typeName: type === WarningType.OVER_MINING ? '超采预警' : type === WarningType.WATER_LEVEL_DROP ? '水位异常' : '许可超限',
      level,
      areaId: area.id,
      areaName: area.name,
      description: type === WarningType.OVER_MINING 
        ? `连续12小时超采${getRandomInRange(30, 50, 1)}%，超出许可量`
        : type === WarningType.WATER_LEVEL_DROP
        ? `水位下降速率${getRandomInRange(0.5, 1.2, 2)}m/h，超过安全阈值`
        : `实际采砂量已超出许可量${getRandomInRange(10, 25, 1)}%`,
      triggerTime: Date.now() - getRandomInRange(0, 72 * 3600 * 1000, 0),
      status,
      currentNode,
      approvalFlow,
      overMiningRate: type === WarningType.OVER_MINING ? getRandomInRange(30, 60, 1) : undefined,
      waterDropRate: type === WarningType.WATER_LEVEL_DROP ? getRandomInRange(0.5, 1.5, 2) : undefined,
    });
  }
  
  return warnings.sort((a, b) => b.triggerTime - a.triggerTime);
}

export function generateMiningPermits(count = 15, miningAreas?: MiningArea[]): MiningPermit[] {
  const permits: MiningPermit[] = [];
  const enterprises = ['长江砂石集团有限公司', '黄河河道工程有限公司', '珠江采砂有限公司', '淮河建材有限公司', '海河砂石有限公司'];
  const areas = miningAreas || generateMiningAreas(count);
  
  for (let i = 0; i < Math.min(count, areas.length); i++) {
    const area = areas[i];
    const permittedAmount = getRandomInRange(100, 500, 2);
    const actualAmount = getRandomInRange(permittedAmount * 0.6, permittedAmount * 1.3, 2);
    const exceedRate = Math.max(0, ((actualAmount - permittedAmount) / permittedAmount) * 100);
    
    let status: PermitStatus = PermitStatus.VALID;
    if (exceedRate >= 10) status = PermitStatus.EXCEEDED;
    
    const workOrders: WorkOrder[] = [];
    if (exceedRate >= 10) {
      workOrders.push({
        id: `workorder-${i + 1}`,
        permitId: `permit-${i + 1}`,
        areaId: area.id,
        areaName: area.name,
        type: 'permit_exceed',
        typeName: '许可超限',
        description: `实际采砂量已超出许可量${exceedRate.toFixed(1)}%，请执法人员现场核查`,
        status: Math.random() > 0.5 ? WorkOrderStatus.PENDING : WorkOrderStatus.PROCESSING,
        assignee: 'law001',
        assigneeName: '执法人员王队',
        createTime: Date.now() - getRandomInRange(0, 7 * 24 * 3600 * 1000, 0),
      });
    }
    
    permits.push({
      id: `permit-${i + 1}`,
      permitNo: `采许字[2026]第${1000 + i}号`,
      areaId: area.id,
      areaName: area.name,
      enterprise: enterprises[i % enterprises.length],
      permittedAmount,
      actualAmount,
      exceedRate: Math.round(exceedRate * 10) / 10,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      status,
      workOrders,
      createTime: Date.now() - getRandomInRange(0, 180 * 24 * 3600 * 1000, 0),
    });
  }
  
  return permits;
}

export function generateWorkOrders(count = 10, miningAreas?: MiningArea[]): WorkOrder[] {
  const orders: WorkOrder[] = [];
  const areas = miningAreas || generateMiningAreas(count);
  const statuses = [WorkOrderStatus.PENDING, WorkOrderStatus.PROCESSING, WorkOrderStatus.CLOSED];
  
  for (let i = 0; i < Math.min(count, areas.length); i++) {
    const area = areas[i];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    orders.push({
      id: `workorder-${i + 100}`,
      permitId: `permit-${Math.floor(i / 2) + 1}`,
      areaId: area.id,
      areaName: area.name,
      type: 'permit_exceed',
      typeName: '许可超限',
      description: `采砂量超出许可${getRandomInRange(10, 30, 1)}%，请现场核查处置`,
      status,
      assignee: `law00${(i % 5) + 1}`,
      assigneeName: ['王队长', '李队员', '张执法', '刘警官', '陈监督'][i % 5],
      createTime: Date.now() - getRandomInRange(0, 14 * 24 * 3600 * 1000, 0),
      handleTime: status !== WorkOrderStatus.PENDING ? Date.now() - getRandomInRange(0, 3 * 24 * 3600 * 1000, 0) : undefined,
      handleResult: status === WorkOrderStatus.CLOSED ? '已现场核查，责令限期整改，并处以罚款' : undefined,
    });
  }
  
  return orders.sort((a, b) => a.createTime - b.createTime);
}

export function generateWeeklyReports(areaId?: string, count = 8, miningAreas?: MiningArea[]): WeeklyReport[] {
  const reports: WeeklyReport[] = [];
  const areas = areaId 
    ? [{ id: areaId, name: '指定采砂区' }] 
    : (miningAreas && miningAreas.length > 0 ? miningAreas : generateMiningAreas(count));
  
  const reportCount = Math.min(count, areas.length);
  for (let i = 0; i < reportCount; i++) {
    const area = areas[i];
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const healthIndex = getRandomInRange(65, 95, 1);
    
    reports.push({
      id: `report-${i + 1}`,
      areaId: area.id,
      areaName: area.name,
      reportDate: date.toISOString().split('T')[0],
      sandMiningAmount: getRandomInRange(500, 2000, 2),
      sandMiningYoy: getRandomInRange(-10, 20, 1),
      sandMiningMom: getRandomInRange(-8, 15, 1),
      overMiningEvents: Math.floor(getRandomInRange(0, 5, 0)),
      healthIndex,
      healthIndexMom: getRandomInRange(-5, 5, 1),
      siltationAssessment: i % 2 === 0 
        ? '本周河道淤积情况轻微，淤积厚度约0.3-0.5米，主要集中在采砂作业区下游'
        : '本周河道淤积明显，部分区域淤积厚度超过1米，建议加强清淤作业',
      recommendations: i % 2 === 0
        ? '1. 建议维持当前采砂配额；2. 加强采砂船作业位置监管，避免集中开采；3. 每月进行一次河道断面监测'
        : '1. 建议下调该采砂区采砂配额15%；2. 立即安排清淤作业；3. 增加监测频次至每两周一次',
      createTime: Date.now() - i * 7 * 24 * 3600 * 1000,
    });
  }
  
  return reports;
}

export function generateWaterMonitorData(hours = 48): WaterMonitorData[] {
  const data: WaterMonitorData[] = [];
  const now = Date.now();
  let waterLevel = getRandomInRange(8, 15, 2);
  let flowRate = getRandomInRange(500, 2000, 2);
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = now - i * 3600 * 1000;
    waterLevel += getRandomInRange(-0.1, 0.05, 3);
    waterLevel = Math.max(5, Math.min(20, waterLevel));
    flowRate += getRandomInRange(-20, 20, 2);
    flowRate = Math.max(200, Math.min(3000, flowRate));
    
    const prevLevel = data.length > 0 ? data[data.length - 1].waterLevel : waterLevel;
    const dropRate = Math.max(0, (prevLevel - waterLevel));
    
    data.push({
      timestamp,
      waterLevel: Math.round(waterLevel * 1000) / 1000,
      flowRate: Math.round(flowRate * 1000) / 1000,
      dropRate: Math.round(dropRate * 1000) / 1000,
    });
  }
  
  return data;
}

export function generateWeighingRecords(areaId: string, days = 7): WeighingRecord[] {
  const records: WeighingRecord[] = [];
  const destinations = ['本地建筑工地', '周边城市A', '周边城市B', '外省调运', '本地搅拌站', '重点工程'];
  const now = Date.now();
  
  for (let day = 0; day < days; day++) {
    const recordCount = Math.floor(getRandomInRange(10, 30, 0));
    for (let i = 0; i < recordCount; i++) {
      const weighTime = now - day * 24 * 3600 * 1000 - getRandomInRange(0, 24 * 3600 * 1000, 0);
      const weight = getRandomInRange(30, 60, 2);
      const isCompliant = weight <= 55;
      
      records.push({
        id: `weigh-${areaId}-${day}-${i}`,
        vehicleNo: `苏A${Math.floor(getRandomInRange(10000, 99999, 0))}`,
        areaId,
        areaName: `${areaId}采砂区`,
        weight,
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        weighTime,
        isCompliant,
      });
    }
  }
  
  return records.sort((a, b) => b.weighTime - a.weighTime);
}

export function generateTransportFlowData(records: WeighingRecord[]): TransportFlowData[] {
  const destMap = new Map<string, number>();
  let total = 0;
  
  records.forEach(r => {
    const current = destMap.get(r.destination) || 0;
    destMap.set(r.destination, current + r.weight);
    total += r.weight;
  });
  
  return Array.from(destMap.entries())
    .map(([destination, value]) => ({
      destination,
      value: Math.round(value * 100) / 100,
      percentage: Math.round((value / total) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.value - a.value);
}

export function generateHealthRank(count = 15): HealthRankItem[] {
  const areas = generateMiningAreas(count);
  
  return areas.map((area, index) => ({
    rank: index + 1,
    areaName: area.name,
    province: area.province,
    healthIndex: area.healthIndex,
    lastWeekIndex: getRandomInRange(60, 95, 1),
    change: Math.round((area.healthIndex - getRandomInRange(60, 95, 1)) * 10) / 10,
  })).sort((a, b) => b.healthIndex - a.healthIndex)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function generateTrendData(days = 30): TrendData[] {
  const data: TrendData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const base = 800;
    const value = base + Math.sin(i / 3) * 100 + getRandomInRange(-50, 50, 2);
    const target = base + Math.sin(i / 5) * 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      target: Math.round(target * 100) / 100,
    });
  }
  
  return data;
}

export function generateHeatmapData(center: [number, number], points = 500) {
  const data: [number, number, number][] = [];
  
  for (let i = 0; i < points; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.1;
    const lng = center[0] + Math.cos(angle) * radius;
    const lat = center[1] + Math.sin(angle) * radius;
    const count = Math.floor(getRandomInRange(1, 100, 0));
    
    data.push([lng, lat, count]);
  }
  
  return data;
}

export const mockVideoUrls = [
  { id: 'cam-001', name: '采砂区入口监控', areaId: 'area-1', areaName: '江苏省南京市采砂区1号', thumbnail: 'https://picsum.photos/seed/cam001/400/225', url: '#' },
  { id: 'cam-002', name: '采砂船1号作业监控', areaId: 'area-1', areaName: '江苏省南京市采砂区1号', thumbnail: 'https://picsum.photos/seed/cam002/400/225', url: '#' },
  { id: 'cam-003', name: '采砂船2号作业监控', areaId: 'area-1', areaName: '江苏省南京市采砂区1号', thumbnail: 'https://picsum.photos/seed/cam003/400/225', url: '#' },
  { id: 'cam-004', name: '过磅站监控', areaId: 'area-1', areaName: '江苏省南京市采砂区1号', thumbnail: 'https://picsum.photos/seed/cam004/400/225', url: '#' },
  { id: 'cam-005', name: '出口地磅监控', areaId: 'area-2', areaName: '江苏省苏州市采砂区2号', thumbnail: 'https://picsum.photos/seed/cam005/400/225', url: '#' },
  { id: 'cam-006', name: '采砂船3号作业监控', areaId: 'area-2', areaName: '江苏省苏州市采砂区2号', thumbnail: 'https://picsum.photos/seed/cam006/400/225', url: '#' },
  { id: 'cam-007', name: '上游水位监测站', areaId: 'area-3', areaName: '浙江省杭州市采砂区3号', thumbnail: 'https://picsum.photos/seed/cam007/400/225', url: '#' },
  { id: 'cam-008', name: '下游生态保护区', areaId: 'area-3', areaName: '浙江省杭州市采砂区3号', thumbnail: 'https://picsum.photos/seed/cam008/400/225', url: '#' },
  { id: 'cam-009', name: '采砂船4号作业监控', areaId: 'area-4', areaName: '安徽省合肥市采砂区4号', thumbnail: 'https://picsum.photos/seed/cam009/400/225', url: '#' },
  { id: 'cam-010', name: '采砂船5号作业监控', areaId: 'area-4', areaName: '安徽省合肥市采砂区4号', thumbnail: 'https://picsum.photos/seed/cam010/400/225', url: '#' },
];

export const mockSystemUsers = [
  { id: '1', username: 'admin', realName: '系统管理员', role: '国家级管理员', region: '全国', status: 'active', lastLogin: '2026-06-17 09:30:00' },
  { id: '2', username: 'province_admin_js', realName: '江苏管理员', role: '省级管理员', region: '江苏省', status: 'active', lastLogin: '2026-06-17 08:15:00' },
  { id: '3', username: 'province_admin_zj', realName: '浙江管理员', role: '省级管理员', region: '浙江省', status: 'active', lastLogin: '2026-06-16 16:45:00' },
  { id: '4', username: 'city_admin_nj', realName: '南京管理员', role: '市级管理员', region: '江苏省南京市', status: 'active', lastLogin: '2026-06-17 10:00:00' },
  { id: '5', username: 'enterprise_001', realName: '长江砂石经办人', role: '采砂企业', region: '江苏省南京市', status: 'active', lastLogin: '2026-06-17 07:50:00' },
  { id: '6', username: 'law_001', realName: '王队长', role: '执法人员', region: '江苏省南京市江宁区', status: 'active', lastLogin: '2026-06-17 06:30:00' },
];

export const mockThresholdConfig = {
  overMiningContinuousHours: 12,
  overMiningRateThreshold: 30,
  waterLevelDropThreshold: 0.5,
  permitExceedThreshold: 10,
  healthIndexExcellent: 90,
  healthIndexGood: 75,
  healthIndexWarning: 60,
};
