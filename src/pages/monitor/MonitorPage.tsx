import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, MapPin, Camera, Droplets, Ship } from 'lucide-react';
import { useAppStore } from '../../store';
import { MonitorMap } from './components/MonitorMap';
import { ShipList } from './components/ShipList';
import { VideoWall } from './components/VideoWall';
import { WaterMonitor } from './components/WaterMonitor';
import { Select, Tag } from 'antd';
import { generateWaterMonitorData } from '../../mock/data';
import type { WaterMonitorData } from '../../types';

type MonitorTab = 'map' | 'video' | 'water';

export function MonitorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MonitorTab>('map');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [filterProvince, setFilterProvince] = useState<string>('all');

  const {
    miningAreas,
    areaShips,
    waterMonitorData,
    fetchMiningAreas,
    fetchAreaDetail,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  } = useAppStore();

  const defaultWaterData = useMemo<WaterMonitorData[]>(() => {
    return generateWaterMonitorData(48);
  }, []);

  const displayWaterData = selectedAreaId ? waterMonitorData : defaultWaterData;
  const selectedArea = miningAreas.find(a => a.id === selectedAreaId);

  useEffect(() => {
    fetchMiningAreas();
    startRealTimeUpdates();

    return () => stopRealTimeUpdates();
  }, [fetchMiningAreas, startRealTimeUpdates, stopRealTimeUpdates]);

  useEffect(() => {
    if (selectedAreaId) {
      fetchAreaDetail(selectedAreaId);
    }
  }, [selectedAreaId, fetchAreaDetail]);

  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId === selectedAreaId ? null : areaId);
    setSelectedShipId(null);
  };

  const handleShipClick = (shipId: string) => {
    setSelectedShipId(shipId === selectedShipId ? null : shipId);
  };

  const handleViewAreaDetail = () => {
    if (selectedAreaId) {
      navigate(`/mining-area/${selectedAreaId}`);
    }
  };

  const filteredAreas = filterProvince === 'all'
    ? miningAreas
    : miningAreas.filter(a => a.province === filterProvince);

  const displayShips = selectedAreaId ? areaShips : miningAreas.flatMap(a => {
    const ships: any[] = [];
    for (let i = 0; i < (a.activeShips || 1); i++) {
      ships.push({
        id: `ship-${a.id}-${i}`,
        name: `${a.name.split('采砂区')[0]}采砂船${i + 1}号`,
        mmsi: `MMSI${Math.floor(Math.random() * 100000000)}`,
        areaId: a.id,
        enterprise: '长江砂石集团',
        currentLocation: [
          a.center[0] + (Math.random() - 0.5) * 0.05,
          a.center[1] + (Math.random() - 0.5) * 0.05,
        ],
        currentStatus: ['mining', 'transporting', 'idle'][Math.floor(Math.random() * 3)],
        todayOutput: Math.random() * 500,
        totalOutput: Math.random() * 50000,
        lastUpdate: Date.now(),
      });
    }
    return ships;
  });

  const provinces = Array.from(new Set(miningAreas.map(a => a.province))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">实时监控</h2>
          <p className="text-gray-500 text-sm">实时监控采砂船位置、视频画面和水情数据</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            实时数据更新中
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MapPin size={16} />
            地图监控
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Camera size={16} />
            视频监控
          </button>
          <button
            onClick={() => setActiveTab('water')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'water'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Droplets size={16} />
            水情监测
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filterProvince}
            onChange={setFilterProvince}
            style={{ width: 150 }}
            size="middle"
            options={[
              { value: 'all', label: '全部省份' },
              ...provinces.map(p => ({ value: p, label: p })),
            ]}
          />
          {selectedAreaId && (
            <button
              onClick={handleViewAreaDetail}
              className="btn-primary text-sm py-2 px-4"
            >
              查看采砂区详情
            </button>
          )}
        </div>
      </div>

      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">全国采砂船实时位置</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-primary-500" />
                  采砂区 <span className="font-semibold text-gray-800">{filteredAreas.length}</span> 个
                </span>
                <span className="flex items-center gap-1">
                  <Ship size={14} className="text-success-500" />
                  采砂船 <span className="font-semibold text-gray-800">{displayShips.length}</span> 艘
                </span>
              </div>
            </div>
            <MonitorMap
              areas={filteredAreas}
              ships={displayShips}
              selectedAreaId={selectedAreaId}
              selectedShipId={selectedShipId}
              onAreaClick={handleAreaClick}
              onShipClick={handleShipClick}
              height={520}
            />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">
                {selectedAreaId 
                  ? miningAreas.find(a => a.id === selectedAreaId)?.name || '采砂船列表'
                  : '采砂船列表'
                }
              </h3>
              {selectedAreaId && (
                <button
                  onClick={() => { setSelectedAreaId(null); setSelectedShipId(null); }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  显示全部
                </button>
              )}
            </div>
            <ShipList
              data={selectedAreaId ? areaShips : displayShips}
              selectedShipId={selectedShipId}
              onShipSelect={handleShipClick}
            />
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">视频监控墙</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Radio size={14} className="text-red-500" />
                  在线 <span className="font-semibold text-gray-800">10</span> 路
                </span>
              </div>
            </div>
            <VideoWall areaId={selectedAreaId || undefined} />
          </div>
        </div>
      )}

      {activeTab === 'water' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="section-title mb-0">水情实时监测</h3>
              {selectedArea ? (
                <Tag color="blue" className="m-0">
                  当前: {selectedArea.name}
                </Tag>
              ) : (
                <Tag color="default" className="m-0">
                  全国平均
                </Tag>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Droplets size={14} className="text-blue-500" />
                监测数据 <span className="font-semibold text-gray-800">{displayWaterData.length}</span> 条
              </span>
            </div>
          </div>
          {!selectedArea && (
            <p className="text-xs text-gray-400 mb-4">
              提示：点击左侧地图中的采砂区可查看该区域的水情数据
            </p>
          )}
          <WaterMonitor data={displayWaterData} />
        </div>
      )}
    </div>
  );
}
