import * as Icons from 'lucide-react';

interface Process {
  name: string;
  status: 'Running' | 'Idle';
  cpu: number;
  memory: string;
  icon: string;
}

export function TaskManager() {
  const processes: Process[] = [
    { name: 'NailHub Social', status: 'Running', cpu: 12, memory: '256 MB', icon: 'heart' },
    { name: 'Portfolio Browser', status: 'Running', cpu: 8, memory: '184 MB', icon: 'globe' },
    { name: 'File Explorer', status: 'Running', cpu: 2, memory: '92 MB', icon: 'folder' },
    { name: 'Calculator', status: 'Idle', cpu: 0, memory: '24 MB', icon: 'calculator' },
    { name: 'Weather Widget', status: 'Running', cpu: 3, memory: '64 MB', icon: 'cloud' },
    { name: 'Notepad', status: 'Idle', cpu: 0, memory: '18 MB', icon: 'file-text' },
    { name: 'Windows Manager', status: 'Running', cpu: 5, memory: '128 MB', icon: 'monitor' },
    { name: 'System Services', status: 'Running', cpu: 4, memory: '96 MB', icon: 'settings' },
  ];

  const getIcon = (iconName: string) => {
    const iconMap: any = {
      heart: Icons.Heart,
      globe: Icons.Globe,
      folder: Icons.Folder,
      calculator: Icons.Calculator,
      cloud: Icons.Cloud,
      'file-text': Icons.FileText,
      monitor: Icons.Monitor,
      settings: Icons.Settings,
    };
    return iconMap[iconName] || Icons.Square;
  };

  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0);
  const totalMemory = 1024;
  const usedMemory = 862;

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">CPU Usage</span>
              <Icons.Cpu className="w-5 h-5 opacity-75" />
            </div>
            <div className="text-3xl font-bold">{totalCpu}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${totalCpu}%` }} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Memory</span>
              <Icons.HardDrive className="w-5 h-5 opacity-75" />
            </div>
            <div className="text-3xl font-bold">{((usedMemory / totalMemory) * 100).toFixed(0)}%</div>
            <div className="text-xs opacity-90 mt-1">{usedMemory} / {totalMemory} MB</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Processes</span>
              <Icons.Activity className="w-5 h-5 opacity-75" />
            </div>
            <div className="text-3xl font-bold">{processes.length}</div>
            <div className="text-xs opacity-90 mt-1">{processes.filter(p => p.status === 'Running').length} running</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase">
            <div className="col-span-5">Process</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">CPU</div>
            <div className="col-span-3">Memory</div>
          </div>

          {processes.map((process, index) => {
            const Icon = getIcon(process.icon);
            return (
              <div
                key={index}
                className="border-b border-gray-100 last:border-0 px-4 py-3 hover:bg-gray-50 transition-colors grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{process.name}</span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    process.status === 'Running'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {process.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 rounded-full h-1.5 transition-all"
                        style={{ width: `${Math.min(process.cpu * 5, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 w-10 text-right">{process.cpu}%</span>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-700">{process.memory}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
