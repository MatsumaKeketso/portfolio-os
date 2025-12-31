import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '../../store/desktopStore';

interface Process {
  id: string;
  name: string;
  status: 'Running' | 'Idle' | 'Minimized';
  cpu: number;
  memory: string;
  icon: string;
  uptime: string;
  isWindow?: boolean;
}

type SortKey = 'name' | 'status' | 'cpu' | 'memory';
type TabType = 'processes' | 'performance' | 'details';

export function TaskManager() {
  const { windows, closeWindow } = useDesktopStore();
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('processes');
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(0));
  const [memoryHistory, setMemoryHistory] = useState<number[]>(Array(20).fill(0));

  // System processes (static background processes)
  const systemProcesses: Process[] = [
    { id: 'sys-1', name: 'Windows Manager', status: 'Running', cpu: 5, memory: '128 MB', icon: 'monitor', uptime: '2:45:30' },
    { id: 'sys-2', name: 'System Services', status: 'Running', cpu: 4, memory: '96 MB', icon: 'settings', uptime: '2:45:30' },
    { id: 'sys-3', name: 'Desktop Environment', status: 'Running', cpu: 3, memory: '112 MB', icon: 'layout-dashboard', uptime: '2:45:30' },
  ];

  // Convert windows to processes
  const windowProcesses: Process[] = windows.map(window => ({
    id: window.id,
    name: window.title,
    status: window.isMinimized ? 'Minimized' : 'Running',
    cpu: Math.floor(Math.random() * 15) + 1, // Simulated CPU usage
    memory: `${Math.floor(Math.random() * 200) + 50} MB`,
    icon: window.icon,
    uptime: '0:15:22', // Simulated uptime
    isWindow: true,
  }));

  const allProcesses = [...windowProcesses, ...systemProcesses];

  // Filter and sort processes
  const filteredProcesses = allProcesses
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'cpu':
          comparison = a.cpu - b.cpu;
          break;
        case 'memory':
          comparison = parseInt(a.memory) - parseInt(b.memory);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalCpu = allProcesses.reduce((sum, p) => sum + p.cpu, 0);
  const totalMemory = 1024;
  const usedMemory = allProcesses.reduce((sum, p) => sum + parseInt(p.memory), 0);

  // Update performance history
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuHistory(prev => [...prev.slice(1), totalCpu]);
      setMemoryHistory(prev => [...prev.slice(1), (usedMemory / totalMemory) * 100]);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalCpu, usedMemory, totalMemory]);

  const handleEndTask = (process: Process) => {
    if (process.isWindow) {
      closeWindow(process.id);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: any = {
      'file-text': Icons.FileText,
      calculator: Icons.Calculator,
      globe: Icons.Globe,
      folder: Icons.Folder,
      cloud: Icons.Cloud,
      monitor: Icons.Monitor,
      settings: Icons.Settings,
      'layout-dashboard': Icons.LayoutDashboard,
      briefcase: Icons.Briefcase,
      user: Icons.User,
      'user-circle': Icons.UserCircle,
      zap: Icons.Zap,
      mail: Icons.Mail,
    };
    return iconMap[iconName] || Icons.Square;
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <Icons.ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <Icons.ChevronDown className="w-3.5 h-3.5" />
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl flex flex-col">
      {/* Header with Tabs */}
      <div className="border-b border-white/10 p-3 flex items-center gap-2 backdrop-blur-sm bg-white/5">
        <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-all ${
              activeTab === 'processes' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.List className="w-3.5 h-3.5" />
            Processes
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-all ${
              activeTab === 'performance' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Activity className="w-3.5 h-3.5" />
            Performance
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-all ${
              activeTab === 'details' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Info className="w-3.5 h-3.5" />
            Details
          </button>
        </div>

        <div className="flex-1" />

        {activeTab === 'processes' && (
          <div className="relative">
            <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs bg-gray-700/40 text-white rounded border border-gray-600/50 focus:outline-none focus:border-primary-500 w-48"
            />
          </div>
        )}

        <span className="text-xs text-gray-400">
          {allProcesses.length} processes
        </span>
      </div>

      {/* Tab Content */}
      {activeTab === 'processes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Cards */}
          <div className="bg-white/5 backdrop-blur-md p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">CPU Usage</span>
                  <Icons.Cpu className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">{totalCpu}%</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${totalCpu}%` }} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Memory</span>
                  <Icons.HardDrive className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">{Math.round((usedMemory / totalMemory) * 100)}%</div>
                <div className="text-xs opacity-90 mt-1">{usedMemory} / {totalMemory} MB</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Active</span>
                  <Icons.Activity className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">{windowProcesses.length}</div>
                <div className="text-xs opacity-90 mt-1">{windowProcesses.filter(p => p.status === 'Running').length} running</div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

          {/* Process List */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white/5 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-white/5 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400">
                <button
                  onClick={() => handleSort('name')}
                  className="col-span-4 flex items-center gap-1 hover:text-white transition-colors"
                >
                  Process
                  <SortIcon column="name" />
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors"
                >
                  Status
                  <SortIcon column="status" />
                </button>
                <button
                  onClick={() => handleSort('cpu')}
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors"
                >
                  CPU
                  <SortIcon column="cpu" />
                </button>
                <button
                  onClick={() => handleSort('memory')}
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors"
                >
                  Memory
                  <SortIcon column="memory" />
                </button>
                <div className="col-span-2">Actions</div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Process Rows */}
              {filteredProcesses.map((process, index) => {
                const Icon = getIcon(process.icon);
                return (
                  <div key={process.id}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 hover:bg-white/5 transition-colors grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary-400 shrink-0" />
                        <span className="text-sm font-medium text-white truncate">{process.name}</span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          process.status === 'Running'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : process.status === 'Minimized'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {process.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-primary-500 rounded-full h-1.5 transition-all"
                              style={{ width: `${Math.min(process.cpu * 5, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-300 w-10 text-right">{process.cpu}%</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-gray-300">{process.memory}</div>
                      <div className="col-span-2">
                        {process.isWindow && (
                          <button
                            onClick={() => handleEndTask(process)}
                            className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded border border-red-500/30 transition-colors flex items-center gap-1"
                          >
                            <Icons.X className="w-3 h-3" />
                            End
                          </button>
                        )}
                      </div>
                    </motion.div>
                    {index < filteredProcesses.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* CPU Performance */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Icons.Cpu className="w-5 h-5 text-primary-400" />
                  CPU
                </h3>
                <span className="text-3xl font-bold text-white">{totalCpu}%</span>
              </div>
              <div className="h-32 flex items-end gap-1">
                {cpuHistory.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary-500 rounded-t transition-all"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Processes:</span>
                  <span className="text-white ml-2">{allProcesses.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Threads:</span>
                  <span className="text-white ml-2">{allProcesses.length * 4}</span>
                </div>
              </div>
            </div>

            {/* Memory Performance */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Icons.HardDrive className="w-5 h-5 text-green-400" />
                  Memory
                </h3>
                <span className="text-3xl font-bold text-white">{usedMemory} MB</span>
              </div>
              <div className="h-32 flex items-end gap-1">
                {memoryHistory.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-500 rounded-t transition-all"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white ml-2">{totalMemory - usedMemory} MB</span>
                </div>
                <div>
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white ml-2">{totalMemory} MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Info className="w-5 h-5 text-primary-400" />
              System Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Operating System:</span>
                <span className="text-white">PortfolioOS v1.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Total Memory:</span>
                <span className="text-white">{totalMemory} MB</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Available Memory:</span>
                <span className="text-white">{totalMemory - usedMemory} MB</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">CPU Usage:</span>
                <span className="text-white">{totalCpu}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Active Windows:</span>
                <span className="text-white">{windowProcesses.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">System Processes:</span>
                <span className="text-white">{systemProcesses.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-white">2:45:30</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
