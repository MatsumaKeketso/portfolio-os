import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '../../store/desktopStore';
import { AppShell } from '../ui/AppShell';

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
    <AppShell>
      {/* Header with Tabs */}
      <div className="border-b border-white/[0.08] p-3 flex items-center gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-1 bg-black/30 rounded p-1">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-all ${activeTab === 'processes' ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:text-white'
              }`}
          >
            <Icons.List className="w-3.5 h-3.5" />
            Processes
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-all ${activeTab === 'performance' ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:text-white'
              }`}
          >
            <Icons.Activity className="w-3.5 h-3.5" />
            Performance
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-all ${activeTab === 'details' ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:text-white'
              }`}
          >
            <Icons.Info className="w-3.5 h-3.5" />
            Details
          </button>
        </div>

        <div className="flex-1" />

        {activeTab === 'processes' && (
          <div className="relative">
            <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs bg-white/[0.06] text-white rounded border border-white/[0.08] focus:outline-none focus:border-white/[0.20] w-48"
            />
          </div>
        )}

        <span className="text-xs text-white/40">
          {allProcesses.length} processes
        </span>
      </div>

      {/* Tab Content */}
      {activeTab === 'processes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Cards */}
          <div className="bg-white/[0.02] p-4 border-b border-white/[0.08]">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 border border-white/[0.08] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">CPU Usage</span>
                  <Icons.Cpu className="w-4 h-4 text-white/30" />
                </div>
                <div className="text-2xl font-bold text-white">{totalCpu}%</div>
                <div className="w-full bg-white/[0.12] rounded-full h-1.5 mt-2">
                  <div className="bg-primary-500 rounded-full h-1.5 transition-all" style={{ width: `${totalCpu}%` }} />
                </div>
              </div>

              <div className="bg-black/30 border border-white/[0.08] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Memory</span>
                  <Icons.HardDrive className="w-4 h-4 text-white/30" />
                </div>
                <div className="text-2xl font-bold text-white">{Math.round((usedMemory / totalMemory) * 100)}%</div>
                <div className="text-xs text-white/30 mt-1">{usedMemory} / {totalMemory} MB</div>
              </div>

              <div className="bg-black/30 border border-white/[0.08] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Active</span>
                  <Icons.Activity className="w-4 h-4 text-white/30" />
                </div>
                <div className="text-2xl font-bold text-white">{windowProcesses.length}</div>
                <div className="text-xs text-white/30 mt-1">{windowProcesses.filter(p => p.status === 'Running').length} running</div>
              </div>
            </div>
          </div>

          {/* Process List */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-black/30 rounded-lg border border-white/[0.08] overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-white/[0.03] grid grid-cols-12 gap-4 text-xs font-semibold text-white/40">
                <button
                  onClick={() => handleSort('name')}
                  className="col-span-4 flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                >
                  Process
                  <SortIcon column="name" />
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className="col-span-2 flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                >
                  Status
                  <SortIcon column="status" />
                </button>
                <button
                  onClick={() => handleSort('cpu')}
                  className="col-span-2 flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                >
                  CPU
                  <SortIcon column="cpu" />
                </button>
                <button
                  onClick={() => handleSort('memory')}
                  className="col-span-2 flex items-center gap-1 text-white/40 hover:text-white transition-colors"
                >
                  Memory
                  <SortIcon column="memory" />
                </button>
                <div className="col-span-2">Actions</div>
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Process Rows */}
              {filteredProcesses.map((process, index) => {
                const Icon = getIcon(process.icon);
                return (
                  <div key={process.id}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 hover:bg-white/[0.04] transition-colors grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary-400 shrink-0" />
                        <span className="text-sm font-medium text-white truncate">{process.name}</span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${process.status === 'Running'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : process.status === 'Minimized'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-white/[0.08] text-white/60 border border-white/[0.12]'
                          }`}>
                          {process.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/[0.12] rounded-full h-1.5">
                            <div
                              className="bg-primary-500 rounded-full h-1.5 transition-all"
                              style={{ width: `${Math.min(process.cpu * 5, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-white/60 w-10 text-right">{process.cpu}%</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-white/60">{process.memory}</div>
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
                      <div className="h-px bg-white/[0.07]" />
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
            <div className="bg-black/30 rounded-lg p-6 border border-white/[0.08]">
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
                  <span className="text-white/40">Processes:</span>
                  <span className="text-white ml-2">{allProcesses.length}</span>
                </div>
                <div>
                  <span className="text-white/40">Threads:</span>
                  <span className="text-white ml-2">{allProcesses.length * 4}</span>
                </div>
              </div>
            </div>

            {/* Memory Performance */}
            <div className="bg-black/30 rounded-lg p-6 border border-white/[0.08]">
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
                  <span className="text-white/40">Available:</span>
                  <span className="text-white ml-2">{totalMemory - usedMemory} MB</span>
                </div>
                <div>
                  <span className="text-white/40">Total:</span>
                  <span className="text-white ml-2">{totalMemory} MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white/[0.04] rounded-lg p-6 border border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Info className="w-5 h-5 text-primary-400" />
              System Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-white/40">Operating System:</span>
                <span className="text-white">GenOS v1.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-white/40">Total Memory:</span>
                <span className="text-white">{totalMemory} MB</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-white/40">Available Memory:</span>
                <span className="text-white">{totalMemory - usedMemory} MB</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-white/40">CPU Usage:</span>
                <span className="text-white">{totalCpu}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-white/40">Active Windows:</span>
                <span className="text-white">{windowProcesses.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-white/40">System Processes:</span>
                <span className="text-white">{systemProcesses.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white/40">Uptime:</span>
                <span className="text-white">2:45:30</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
