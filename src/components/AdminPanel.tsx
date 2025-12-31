import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { App } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from './ui/card';
import { useTheme } from '../theme';

export function AdminPanel() {
  const { theme } = useTheme();
  const {
    apps, isAdminMode, addApp, removeApp, updateApp, exportConfig, importConfig,
    backgrounds, selectedBackgroundId, addBackground, removeBackground, setSelectedBackground
  } = useDesktopStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [quickURL, setQuickURL] = useState('');
  const [bulkURLs, setBulkURLs] = useState('');
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'backgrounds'>('apps');
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

  const extractAppNameFromURL = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const name = hostname.split('.')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return 'New App';
    }
  };

  const handleQuickAdd = () => {
    if (!quickURL.trim()) return;

    let url = quickURL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const appName = extractAppNameFromURL(url);
    const newApp: App = {
      id: `${appName.toLowerCase()}-${Date.now()}`,
      name: appName,
      icon: 'globe',
      type: 'iframe',
      url: url,
      pinnedToTaskbar: true,
      pinnedToDesktop: true,
      desktopPosition: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
      defaultSize: { width: 1000, height: 700 },
      description: `Iframe app: ${url}`
    };

    addApp(newApp);
    setQuickURL('');
    setShowQuickAdd(false);
  };

  const handleBulkImport = () => {
    if (!bulkURLs.trim()) return;

    const urls = bulkURLs.split('\n').filter(line => line.trim());

    urls.forEach((line, index) => {
      const parts = line.split('|').map(p => p.trim());
      let url = parts[0];
      const name = parts[1] || extractAppNameFromURL(url);
      const icon = parts[2] || 'globe';

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const newApp: App = {
        id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
        name: name,
        icon: icon,
        type: 'iframe',
        url: url,
        pinnedToTaskbar: true,
        pinnedToDesktop: true,
        desktopPosition: { x: 50 + (index * 30), y: 50 + (index * 30) },
        defaultSize: { width: 1000, height: 700 },
        description: `Iframe app: ${url}`
      };

      addApp(newApp);
    });

    setBulkURLs('');
    setShowBulkImport(false);
  };

  const handleURLPreview = (url: string) => {
    if (url.trim()) {
      let fullURL = url.trim();
      if (!fullURL.startsWith('http://') && !fullURL.startsWith('https://')) {
        fullURL = 'https://' + fullURL;
      }
      setPreviewURL(fullURL);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || Icons.Square;
    return Icon;
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newBackground = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          url: dataUrl,
          thumbnail: dataUrl
        };
        addBackground(newBackground);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  if (!isAdminMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: theme.zIndex.modalOverlay,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: `blur(${theme.blur.sm})`,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: Number(theme.transitions.duration.normal.replace('ms', '')) / 1000 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
          style={{
            backgroundColor: theme.palette.background.dark,
            borderRadius: theme.borderRadius['2xl'],
            boxShadow: theme.shadows['2xl'],
            borderWidth: '1px',
            borderColor: theme.palette.glass.border.dark,
          }}
        >
          <div className="p-6 text-white" style={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Icons.Shield className="w-6 h-6" />
                  Admin Dashboard
                </h2>
                <p className="text-blue-100 text-sm mt-1">Manage apps and configuration</p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'apps' && (
                  <>
                    <Button
                      onClick={handleExport}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 border-none"
                    >
                      <Icons.Download className="w-4 h-4" />
                      Export
                    </Button>
                    <label className="cursor-pointer">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 border-none"
                        asChild
                      >
                        <span>
                          <Icons.Upload className="w-4 h-4" />
                          Import
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setActiveTab('apps')}
                variant="secondary"
                size="md"
                className={
                  activeTab === 'apps'
                    ? 'bg-white text-blue-600 hover:bg-white/90 border-none'
                    : 'bg-white/20 text-white hover:bg-white/30 border-none'
                }
              >
                <Icons.Grid3x3 className="w-4 h-4 inline mr-2" />
                Apps
              </Button>
              <Button
                onClick={() => setActiveTab('backgrounds')}
                variant="secondary"
                size="md"
                className={
                  activeTab === 'backgrounds'
                    ? 'bg-white text-blue-600 hover:bg-white/90 border-none'
                    : 'bg-white/20 text-white hover:bg-white/30 border-none'
                }
              >
                <Icons.Image className="w-4 h-4 inline mr-2" />
                Backgrounds
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {activeTab === 'apps' && (
              <>
                <div className="mb-6 grid grid-cols-3 gap-3">
              <Button
                onClick={() => {
                  setShowQuickAdd(!showQuickAdd);
                  setShowAddForm(false);
                  setShowBulkImport(false);
                }}
                variant="success"
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Icons.Zap className="w-5 h-5" />
                Quick Add URL
              </Button>
              <Button
                onClick={() => {
                  setShowBulkImport(!showBulkImport);
                  setShowAddForm(false);
                  setShowQuickAdd(false);
                }}
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Icons.Package className="w-5 h-5" />
                Bulk Import
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowQuickAdd(false);
                  setShowBulkImport(false);
                }}
                variant="primary"
                size="lg"
              >
                <Icons.Plus className="w-5 h-5" />
                Advanced Add
              </Button>
            </div>

            {showQuickAdd && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-6 mb-6 border border-green-700"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icons.Zap className="w-5 h-5" />
                  Quick Add from URL
                </h3>
                <p className="text-green-100 text-sm mb-4">
                  Paste any website URL to instantly add it as an iframe app. We'll auto-detect the name and set optimal defaults.
                </p>
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={quickURL}
                    onChange={(e) => setQuickURL(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                    variant="solid"
                    size="lg"
                    className="border-green-600 focus:border-green-400"
                    placeholder="https://example.com or example.com"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickAdd}
                      variant="success"
                      size="md"
                      className="flex-1"
                    >
                      Add App
                    </Button>
                    {quickURL && (
                      <Button
                        onClick={() => handleURLPreview(quickURL)}
                        variant="secondary"
                        size="md"
                      >
                        <Icons.Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {showBulkImport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 mb-6 border border-purple-700"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icons.Package className="w-5 h-5" />
                  Bulk Import Apps
                </h3>
                <p className="text-purple-100 text-sm mb-4">
                  Add multiple apps at once. Enter one URL per line. Optional format: <code className="bg-black/30 px-1 rounded">URL | Name | Icon</code>
                </p>
                <div className="space-y-3">
                  <textarea
                    value={bulkURLs}
                    onChange={(e) => setBulkURLs(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-purple-600 focus:outline-none focus:border-purple-400 placeholder-gray-400 font-mono text-sm"
                    placeholder={"https://example1.com\nhttps://example2.com | Custom Name | gamepad-2\nhttps://example3.com | Another App"}
                    rows={6}
                    autoFocus
                  />
                  <Button
                    onClick={handleBulkImport}
                    variant="primary"
                    size="md"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Import All Apps
                  </Button>
                </div>
              </motion.div>
            )}

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
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        variant="solid"
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
                      <Input
                        type="text"
                        value={formData.component}
                        onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        variant="solid"
                        placeholder="MyComponent"
                      />
                    </div>
                  )}

                  {formData.type === 'iframe' && (
                    <div>
                      <label className="text-white text-sm mb-2 block">URL</label>
                      <Input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        variant="solid"
                        placeholder="https://example.com"
                        required
                      />
                      <p className="text-gray-400 text-xs mt-1">Add any external website or web app URL</p>
                    </div>
                  )}

                  <div>
                    <label className="text-white text-sm mb-2 block">Description</label>
                    <Input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      variant="solid"
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
                      <Input
                        type="number"
                        value={formData.defaultSize?.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultSize: { ...formData.defaultSize, width: parseInt(e.target.value) || 800 }
                        })}
                        variant="solid"
                        min={300}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Height (px)</label>
                      <Input
                        type="number"
                        value={formData.defaultSize?.height}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultSize: { ...formData.defaultSize, height: parseInt(e.target.value) || 600 }
                        })}
                        variant="solid"
                        min={200}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      {editingApp ? 'Update App' : 'Create App'}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="secondary"
                      size="md"
                    >
                      Cancel
                    </Button>
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
                        <Button
                          onClick={() => handleEdit(app)}
                          variant="primary"
                          size="icon"
                          className="w-8 h-8"
                        >
                          <Icons.Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeApp(app.id)}
                          variant="danger"
                          size="icon"
                          className="w-8 h-8"
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              </>
            )}

            {activeTab === 'backgrounds' && (
              <>
                <div className="mb-6">
                  <label className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold cursor-pointer">
                    <Icons.Upload className="w-5 h-5" />
                    Upload Background Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-400 text-sm text-center mt-2">
                    Upload JPG, PNG, or WebP images (multiple files supported)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {backgrounds.map((bg) => {
                    const isSelected = selectedBackgroundId === bg.id;
                    const isDefault = bg.id.startsWith('default-');
                    const isGradient = bg.url.startsWith('linear-gradient');

                    return (
                      <div
                        key={bg.id}
                        className={`relative rounded-xl overflow-hidden border-4 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedBackground(bg.id)}
                      >
                        <div
                          className="w-full h-40 bg-cover bg-center"
                          style={{
                            background: isGradient ? bg.url : 'transparent',
                            backgroundImage: !isGradient ? `url(${bg.url})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />

                        <div className="bg-gray-800/95 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-sm truncate">
                                {bg.name}
                              </h3>
                              {isDefault && (
                                <span className="text-xs text-gray-400">Built-in</span>
                              )}
                            </div>
                            {isSelected && (
                              <Icons.Check className="w-5 h-5 text-blue-400 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>

                        {!isDefault && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBackground(bg.id);
                            }}
                            variant="danger"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                          >
                            <Icons.Trash2 className="w-4 h-4 text-white" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {backgrounds.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Icons.Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No backgrounds available. Upload some images to get started!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {previewURL && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[15001] flex items-center justify-center p-4"
            onClick={() => setPreviewURL(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Preview</h3>
                  <p className="text-xs text-blue-100">{previewURL}</p>
                </div>
                <Button
                  onClick={() => setPreviewURL(null)}
                  variant="ghost"
                  size="icon"
                >
                  <Icons.X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 bg-white">
                <iframe
                  src={previewURL}
                  className="w-full h-full"
                  title="App Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
