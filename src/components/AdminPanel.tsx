import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { App } from '../types';

export function AdminPanel() {
  const { apps, isAdminMode, addApp, removeApp, updateApp, exportConfig, importConfig } = useDesktopStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<App>>({
    name: '',
    icon: 'square',
    type: 'component',
    component: '',
    url: '',
    pinnedToTaskbar: false,
    pinnedToDesktop: true,
    desktopPosition: { x: 50, y: 50 },
    defaultSize: { width: 800, height: 600 },
    description: ''
  });

  const iconOptions = [
    'folder', 'globe', 'calculator', 'file-text', 'cloud', 'activity', 'heart',
    'github', 'user', 'briefcase', 'code', 'terminal', 'image', 'video',
    'music', 'book', 'mail', 'phone', 'settings', 'star', 'search', 'chrome',
    'link', 'radio', 'zap', 'trello', 'figma', 'github-pages', 'shopping-cart'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'square',
      type: 'component',
      component: '',
      url: '',
      pinnedToTaskbar: false,
      pinnedToDesktop: true,
      desktopPosition: { x: 50, y: 50 },
      defaultSize: { width: 800, height: 600 },
      description: ''
    });
    setEditingApp(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) return;

    if (editingApp) {
      updateApp(editingApp, formData);
    } else {
      const newApp: App = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        icon: formData.icon || 'square',
        type: formData.type || 'component',
        component: formData.component,
        url: formData.url,
        pinnedToTaskbar: formData.pinnedToTaskbar || false,
        pinnedToDesktop: formData.pinnedToDesktop !== false,
        desktopPosition: formData.desktopPosition || { x: 50, y: 50 },
        defaultSize: formData.defaultSize || { width: 800, height: 600 },
        description: formData.description || ''
      };
      addApp(newApp);
    }

    resetForm();
  };

  const handleEdit = (app: App) => {
    setFormData(app);
    setEditingApp(app.id);
    setShowAddForm(true);
  };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolioOS-config.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        importConfig(json);
      };
      reader.readAsText(file);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  if (!isAdminMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[15000] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Icons.Shield className="w-6 h-6" />
                  Admin Dashboard
                </h2>
                <p className="text-blue-100 text-sm mt-1">Manage apps and configuration</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Icons.Download className="w-4 h-4" />
                  Export
                </button>
                <label className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all cursor-pointer">
                  <Icons.Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold"
              >
                <Icons.Plus className="w-5 h-5" />
                {showAddForm ? 'Cancel' : 'Add New App'}
              </button>
            </div>

            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
              >
                <h3 className="text-white text-lg font-semibold mb-4">
                  {editingApp ? 'Edit App' : 'New App'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">App Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="My App"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Icon</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="component">React Component</option>
                      <option value="iframe">IFrame URL</option>
                      <option value="static">Static Content</option>
                    </select>
                  </div>

                  {formData.type === 'component' && (
                    <div>
                      <label className="text-white text-sm mb-2 block">Component Name</label>
                      <input
                        type="text"
                        value={formData.component}
                        onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="MyComponent"
                      />
                    </div>
                  )}

                  {formData.type === 'iframe' && (
                    <div>
                      <label className="text-white text-sm mb-2 block">URL</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="https://example.com"
                        required
                      />
                      <p className="text-gray-400 text-xs mt-1">Add any external website or web app URL</p>
                    </div>
                  )}

                  <div>
                    <label className="text-white text-sm mb-2 block">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pinnedToTaskbar}
                        onChange={(e) => setFormData({ ...formData, pinnedToTaskbar: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Pin to Taskbar
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pinnedToDesktop}
                        onChange={(e) => setFormData({ ...formData, pinnedToDesktop: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Pin to Desktop
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Width (px)</label>
                      <input
                        type="number"
                        value={formData.defaultSize?.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultSize: { ...formData.defaultSize, width: parseInt(e.target.value) || 800 }
                        })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        min="300"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Height (px)</label>
                      <input
                        type="number"
                        value={formData.defaultSize?.height}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultSize: { ...formData.defaultSize, height: parseInt(e.target.value) || 600 }
                        })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        min="200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                    >
                      {editingApp ? 'Update App' : 'Create App'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-700/50 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-300 uppercase">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Taskbar</div>
                <div className="col-span-2">Desktop</div>
                <div className="col-span-3">Actions</div>
              </div>

              <div className="divide-y divide-gray-700">
                {apps.map((app) => {
                  const Icon = getIcon(app.icon);
                  return (
                    <div key={app.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-700/30 transition-colors">
                      <div className="col-span-3 flex items-center gap-2">
                        <Icon className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-sm font-medium truncate">{app.name}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          {app.type}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {app.pinnedToTaskbar ? (
                          <Icons.Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Icons.X className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="col-span-2">
                        {app.pinnedToDesktop ? (
                          <Icons.Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Icons.X className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="col-span-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(app)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white transition-all"
                        >
                          <Icons.Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeApp(app.id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white transition-all"
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
