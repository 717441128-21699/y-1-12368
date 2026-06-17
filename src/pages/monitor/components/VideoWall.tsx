import { useState } from 'react';
import { Video, Maximize2, Play, RefreshCw } from 'lucide-react';
import { mockVideoUrls } from '../../../mock/data';

interface VideoWallProps {
  areaId?: string;
}

export function VideoWall({ areaId }: VideoWallProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  const handleRefresh = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }, 1500);
  };

  const displayVideos = areaId 
    ? mockVideoUrls.filter(v => v.areaId === areaId).slice(0, 6)
    : mockVideoUrls.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {displayVideos.map((video, index) => (
          <div
            key={video.id}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
              selectedIndex === index
                ? 'border-primary-500 shadow-lg scale-[1.02]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
          >
            <div className="aspect-video bg-gray-900 relative">
              {loadingStates[index] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <RefreshCw size={24} className="text-gray-400 animate-spin" />
                </div>
              ) : (
                <>
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-white font-medium">LIVE</span>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRefresh(index); }}
                      className="w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-white text-xs font-medium truncate">{video.name}</div>
                    <div className="text-white/70 text-[10px]">{video.areaName}</div>
                  </div>
                </>
              )}
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors ml-1"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: Math.max(0, 6 - displayVideos.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
          >
            <div className="text-center text-gray-400">
              <Video size={24} className="mx-auto mb-1 opacity-50" />
              <div className="text-xs">暂无监控</div>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && displayVideos[selectedIndex] && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{displayVideos[selectedIndex].name}</h4>
            <button
              onClick={() => setSelectedIndex(null)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              关闭详情
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-500">采砂区:</span>
              <span className="ml-1 font-medium text-gray-800">{displayVideos[selectedIndex].areaName}</span>
            </div>
            <div>
              <span className="text-gray-500">分辨率:</span>
              <span className="ml-1 font-medium text-gray-800">1080P</span>
            </div>
            <div>
              <span className="text-gray-500">帧率:</span>
              <span className="ml-1 font-medium text-gray-800">25fps</span>
            </div>
            <div>
              <span className="text-gray-500">码率:</span>
              <span className="ml-1 font-medium text-gray-800">4Mbps</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
