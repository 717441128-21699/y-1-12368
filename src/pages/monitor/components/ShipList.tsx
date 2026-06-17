import { Ship, Anchor, Navigation } from 'lucide-react';
import type { MiningShip } from '../../../types';
import { getStatusText, getStatusClass, formatNumber } from '../../../utils';

interface ShipListProps {
  data: MiningShip[];
  selectedShipId: string | null;
  onShipSelect: (shipId: string) => void;
}

export function ShipList({ data, selectedShipId, onShipSelect }: ShipListProps) {
  const miningCount = data.filter(s => s.currentStatus === 'mining').length;
  const transportingCount = data.filter(s => s.currentStatus === 'transporting').length;
  const idleCount = data.filter(s => s.currentStatus === 'idle').length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-success-50 rounded-lg">
          <div className="text-lg font-bold text-success-600">{miningCount}</div>
          <div className="text-xs text-gray-500">正在作业</div>
        </div>
        <div className="text-center p-2 bg-primary-50 rounded-lg">
          <div className="text-lg font-bold text-primary-600">{transportingCount}</div>
          <div className="text-xs text-gray-500">运输中</div>
        </div>
        <div className="text-center p-2 bg-gray-100 rounded-lg">
          <div className="text-lg font-bold text-gray-600">{idleCount}</div>
          <div className="text-xs text-gray-500">空闲</div>
        </div>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
        {data.map((ship) => (
          <div
            key={ship.id}
            onClick={() => onShipSelect(ship.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
              selectedShipId === ship.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ship.currentStatus === 'mining' ? 'bg-success-100 text-success-600' :
                  ship.currentStatus === 'transporting' ? 'bg-primary-100 text-primary-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {ship.currentStatus === 'mining' ? <Anchor size={16} /> :
                   ship.currentStatus === 'transporting' ? <Navigation size={16} /> :
                   <Ship size={16} />}
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{ship.name}</div>
                  <div className="text-xs text-gray-500">MMSI: {ship.mmsi}</div>
                </div>
              </div>
              <span className={`status-badge ${getStatusClass(ship.currentStatus as string)}`}>
                {getStatusText(ship.currentStatus as string)}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">今日产量:</span>
                <span className="ml-1 font-semibold text-gray-800">{formatNumber(ship.todayOutput, 2)}吨</span>
              </div>
              <div>
                <span className="text-gray-500">累计产量:</span>
                <span className="ml-1 font-semibold text-gray-800">{formatNumber(ship.totalOutput / 10000, 2)}万吨</span>
              </div>
            </div>

            <div className="mt-1 text-xs text-gray-400">
              最后更新: {new Date(ship.lastUpdate).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
