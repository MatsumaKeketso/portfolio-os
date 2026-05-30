import { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useDesktopStore } from '../../store/desktopStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Button } from '../ui/button';
import { uploadFile, UploadProgress as UploadProgressType } from '../../lib/uploadUtils';
import { UploadProgress } from '../UploadProgress';
import { AppShell, appSelectClass, appPanelClass, appRowClass } from '../ui/AppShell';
import { cn } from '../../lib/utils';
import logoColor from '../../assets/png-color-symbol.png';
import logoWhite from '../../assets/png-white-symbol.png';
import logoBlack from '../../assets/png-black-symbol.png';

const START_LOGO_VARIANTS = { color: logoColor, white: logoWhite, black: logoBlack } as const;

type TabType = 'profile' | 'appearance' | 'system' | 'privacy' | 'data';

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [, setIsUploading] = useState(false);
  const { profile, error, updatePersonal, updatePreferences, exportProfile, importProfile, resetProfile } = useUserStore();
  const { isAdmin } = useAuthStore();
  const {
    openWindow,
    apps,
    backgrounds,
    selectedBackgroundId,
    addBackground,
    removeBackground,
    setSelectedBackground,
    systemPreferences,
    setTaskbarPosition,
    setTaskbarSize,
    setAutoHideTaskbar,
    setIconSize,
    setWindowAnimations,
    updateSystemPreferences,
  } = useDesktopStore();
  const { addNotification } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelClass = cn(appPanelClass, 'p-6');
  const rowClass = cn(appRowClass, 'p-4');
  const selectClass = cn(appSelectClass, 'w-full px-4 py-2 text-sm cursor-pointer');

  // Watch for store errors
  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error,
        duration: 5000,
      });
    }
  }, [error, addNotification]);

  // Local state for editing
  const [quickEdit, setQuickEdit] = useState({
    name: profile.personal.name,
    title: profile.personal.title
  });

  const [preferences, setPreferences] = useState({
    ...profile.preferences
  });

  const handleQuickSave = () => {
    updatePersonal(quickEdit);
    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully',
    });
  };

  const handlePreferencesSave = () => {
    updatePreferences(preferences);
    addNotification({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Your preferences have been saved successfully',
    });
  };

  const handleBackgroundSelect = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    addNotification({
      type: 'success',
      title: 'Background Changed',
      message: 'Desktop background updated successfully',
      duration: 2000,
    });
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress([]);

    try {
      const result = await uploadFile(file, {
        folder: 'backgrounds',
        maxSizeMB: 5,
        allowedTypes: ['image/*'],
        onProgress: (progress) => {
          setUploadProgress([progress]);
        },
      });

      if (result.url && !result.error) {
        const newBackground = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: result.url,
          type: 'image' as const,
          thumbnail: result.url,
        };
        addBackground(newBackground);
        setSelectedBackground(newBackground.id);
        addNotification({
          type: 'success',
          title: 'Background Added',
          message: 'Custom background uploaded successfully',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Upload Failed',
          message: result.error || 'Failed to upload background',
        });
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      addNotification({
        type: 'error',
        title: 'Upload Error',
        message: 'An error occurred while uploading the background',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveBackground = (backgroundId: string) => {
    if (backgroundId.startsWith('default-')) {
      addNotification({
        type: 'error',
        title: 'Cannot Remove',
        message: 'Default backgrounds cannot be removed',
      });
      return;
    }

    if (confirm('Are you sure you want to remove this background?')) {
      removeBackground(backgroundId);
      addNotification({
        type: 'success',
        title: 'Background Removed',
        message: 'Custom background has been removed',
      });
    }
  };

  const handleExport = () => {
    exportProfile();
    addNotification({
      type: 'success',
      title: 'Profile Exported',
      message: 'Your profile has been exported successfully',
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const profileData = JSON.parse(json);
        importProfile(profileData);

        addNotification({
          type: 'success',
          title: 'Profile Imported',
          message: 'Profile imported successfully! Please refresh to see changes.',
          duration: 5000,
        });
        // Reset local state
        setQuickEdit({
          name: profile.personal.name,
          title: profile.personal.title
        });
        setPreferences({ ...profile.preferences });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'Failed to import profile. Please check the file format.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your profile to defaults? This cannot be undone.')) {
      resetProfile();
      addNotification({
        type: 'success',
        title: 'Profile Reset',
        message: 'Profile reset successfully! Please refresh the page.',
        duration: 5000,
      });
    }
  };

  const openAboutApp = () => {
    const aboutApp = apps.find(app => app.id === 'about');
    if (aboutApp) {
      openWindow(aboutApp);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="px-6 py-4 border-b border-os-line-dark">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Icons.Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage your portfolio settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 px-6 py-3 border-b border-os-line-dark overflow-x-auto">
        {isAdmin && (
          <Button
            variant={activeTab === 'profile' ? 'soft-system-primary' : 'ink-ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
          >
            <Icons.User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        )}
        <Button
          variant={activeTab === 'appearance' ? 'soft-system-primary' : 'ink-ghost'}
          size="sm"
          onClick={() => setActiveTab('appearance')}
        >
          <Icons.Palette className="w-4 h-4 mr-2" />
          Appearance
        </Button>
        <Button
          variant={activeTab === 'system' ? 'soft-system-primary' : 'ink-ghost'}
          size="sm"
          onClick={() => setActiveTab('system')}
        >
          <Icons.Monitor className="w-4 h-4 mr-2" />
          System
        </Button>
        <Button
          variant={activeTab === 'privacy' ? 'soft-system-primary' : 'ink-ghost'}
          size="sm"
          onClick={() => setActiveTab('privacy')}
        >
          <Icons.Shield className="w-4 h-4 mr-2" />
          Privacy
        </Button>
        <Button
          variant={activeTab === 'data' ? 'soft-system-primary' : 'ink-ghost'}
          size="sm"
          onClick={() => setActiveTab('data')}
        >
          <Icons.Database className="w-4 h-4 mr-2" />
          Data
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-[calc(1.5rem+var(--window-cutout-bottom,0px))]">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <UploadProgress
              uploads={uploadProgress}
              onClose={() => setUploadProgress([])}
            />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {isAdmin ? (
                <>
                  <div className={panelClass}>
                    <h3 className="text-xl font-semibold text-white mb-4">Quick Edit</h3>
                    <p className="text-white/40 text-sm mb-4">
                      Update your basic information quickly here, or open the About Me app for full profile editing.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm mb-2 block">Name</label>
                        <input
                          type="text"
                          value={quickEdit.name}
                          onChange={(e) => setQuickEdit({ ...quickEdit, name: e.target.value })}
                          className="w-full bg-os-ink-800 border border-os-line-dark rounded px-4 py-2 text-white outline-none focus:border-stroke-brand transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm mb-2 block">Title</label>
                        <input
                          type="text"
                          value={quickEdit.title}
                          onChange={(e) => setQuickEdit({ ...quickEdit, title: e.target.value })}
                          className="w-full bg-os-ink-800 border border-os-line-dark rounded px-4 py-2 text-white outline-none focus:border-stroke-brand transition-colors"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="soft-system-primary" size="sm" onClick={handleQuickSave}>
                          <Icons.Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="soft-system-secondary" size="sm" onClick={openAboutApp}>
                          <Icons.ExternalLink className="w-4 h-4 mr-2" />
                          Edit Full Profile
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className={panelClass}>
                    <div className="flex items-start gap-4">
                      <Icons.Info className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">Profile Information</h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          Your profile data is stored locally in your browser and automatically saved.
                          Use the Data tab to export a backup or import profile data from another device.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={cn(panelClass, 'text-center')}>
                  <Icons.Lock className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
                  <p className="text-white/40 text-sm">
                    Please sign in as admin to edit profile information.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <>
              {/* Background Management */}
              <div className={panelClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Icons.Image className="w-5 h-5" />
                    Desktop Background
                  </h3>
                  {isAdmin && (
                    <>
                      <Button variant="soft-system-secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Icons.Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                <p className="text-white/40 text-sm mb-4">
                  Choose a background or upload your own custom image (max 5MB)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {backgrounds.map((bg) => (
                    <div
                      key={bg.id}
                      className={`group relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedBackgroundId === bg.id
                        ? 'border-primary-400 ring-2 ring-primary-400/50'
                        : 'border-os-line-dark hover:border-os-line-dark-hover'
                        }`}
                      onClick={() => handleBackgroundSelect(bg.id)}
                    >
                      <div
                        className="aspect-video flex items-center justify-center"
                        style={{
                          background: bg.type === 'gradient' ? bg.url : bg.type === 'image' ? `url(${bg.url}) center/cover` : '#1e293b'
                        }}
                      >
                        {bg.type === 'aurora' && (
                          <div className="text-white/50 text-xs">Aurora</div>
                        )}
                        {bg.type === 'beams' && (
                          <div className="text-white/50 text-xs">Beams</div>
                        )}
                        {bg.type === 'grid' && (
                          <div className="text-white/50 text-xs">Grid</div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        {selectedBackgroundId === bg.id && (
                          <div className="absolute top-2 right-2 bg-primary-500 rounded-full p-1">
                            <Icons.Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isAdmin && !bg.id.startsWith('default-') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBackground(bg.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 absolute top-2 left-2 bg-error hover:bg-error rounded-full p-1 transition-all"
                          >
                            <Icons.Trash2 className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                        <p className="text-white text-xs font-medium truncate">{bg.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Settings */}
              <div className={panelClass}>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Type className="w-5 h-5" />
                  Display Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Font Size</label>
                    <select
                      value={preferences.fontSize}
                      onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value as 'sm' | 'md' | 'lg' })}
                      className={selectClass}
                    >
                      <option value="sm" className="bg-black/30">Small</option>
                      <option value="md" className="bg-black/30">Medium</option>
                      <option value="lg" className="bg-black/30">Large</option>
                    </select>
                    <p className="text-white/40 text-xs mt-1">Change the base font size for better readability</p>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={preferences.accentColor || '#667eea'}
                        onChange={(e) => setPreferences({ ...preferences, accentColor: e.target.value })}
                        className="w-16 h-10 rounded border border-os-line-dark cursor-pointer"
                      />
                      <span className="text-white/60 text-sm">
                        {preferences.accentColor || '#667eea'}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-1">Customize the theme accent color</p>
                  </div>

                  <Button variant="soft-system-primary" size="sm" onClick={handlePreferencesSave}>
                    <Icons.Save className="w-4 h-4 mr-2" />
                    Save Display Settings
                  </Button>
                </div>
              </div>

              <div className={panelClass}>
                <div className="flex items-start gap-4">
                  <Icons.Sparkles className="w-6 h-6 text-tertiary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Personalization</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Customize your GenOS experience with backgrounds, colors, and display preferences.
                      All changes are saved automatically and applied immediately.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <>
              {/* Taskbar Settings */}
              <div className={panelClass}>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Layout className="w-5 h-5" />
                  Taskbar Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Taskbar Position</label>
                    <select
                      className={selectClass}
                      value={systemPreferences.taskbarPosition}
                      onChange={(e) => {
                        setTaskbarPosition(e.target.value as any);
                        addNotification({
                          type: 'success',
                          title: 'Taskbar Position Changed',
                          message: `Taskbar moved to ${e.target.value}`,
                          duration: 2000,
                        });
                      }}
                    >
                      <option value="top" className="bg-black/30">Top</option>
                      <option value="bottom" className="bg-black/30">Bottom</option>
                      <option value="left" className="bg-black/30">Left</option>
                      <option value="right" className="bg-black/30">Right</option>
                    </select>
                    <p className="text-white/40 text-xs mt-1">Change where the taskbar appears</p>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Taskbar Size</label>
                    <select
                      className={selectClass}
                      value={systemPreferences.taskbarSize}
                      onChange={(e) => {
                        setTaskbarSize(e.target.value as any);
                        addNotification({
                          type: 'success',
                          title: 'Taskbar Size Changed',
                          message: `Taskbar size set to ${e.target.value}`,
                          duration: 2000,
                        });
                      }}
                    >
                      <option value="small" className="bg-black/30">Small</option>
                      <option value="medium" className="bg-black/30">Medium</option>
                      <option value="large" className="bg-black/30">Large</option>
                    </select>
                    <p className="text-white/40 text-xs mt-1">Adjust taskbar height/width</p>
                  </div>

                  <label className={cn(rowClass, 'cursor-pointer hover:bg-os-ink-800')}>
                    <input
                      type="checkbox"
                      checked={systemPreferences.autoHideTaskbar}
                      onChange={(e) => {
                        setAutoHideTaskbar(e.target.checked);
                        addNotification({
                          type: 'info',
                          title: 'Auto-hide Taskbar',
                          message: e.target.checked ? 'Taskbar will auto-hide' : 'Taskbar always visible',
                          duration: 2000,
                        });
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Maximize2 className="w-4 h-4 text-primary-400" />
                        <span className="text-white font-medium">Auto-hide Taskbar</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        Automatically hide taskbar when not in use
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="text-white text-sm mb-2 block">Start Button Icon</label>
                    <div className="flex gap-2">
                      {(['color', 'white', 'black'] as const).map(variant => (
                        <button
                          key={variant}
                          onClick={() => {
                            updateSystemPreferences({ startIconVariant: variant });
                            addNotification({ type: 'success', title: 'Start Icon Updated', message: `Using ${variant} logo variant`, duration: 2000 });
                          }}
                          className={cn(
                            'flex-1 flex flex-col items-center gap-2 rounded-lg border px-3 py-3 transition-all',
                            (systemPreferences.startIconVariant ?? 'color') === variant
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-os-line-dark bg-os-ink-950/60 text-white/40 hover:border-os-line-dark-hover hover:text-white/70'
                          )}
                        >
                          <span className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden',
                            variant === 'black' ? 'bg-white' : variant === 'white' ? 'bg-os-ink-800' : 'bg-os-ink-900'
                          )}>
                            <img
                              src={START_LOGO_VARIANTS[variant]}
                              alt={`${variant} logo`}
                              className="w-5 h-5 object-contain"
                            />
                          </span>
                          <span className="text-xs capitalize">{variant}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-white/40 text-xs mt-1">Choose the logo variant for the start button</p>
                  </div>
                </div>
              </div>

              {/* Desktop Settings */}
              <div className={panelClass}>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Monitor className="w-5 h-5" />
                  Desktop Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Icon Size</label>
                    <select
                      className={selectClass}
                      value={systemPreferences.iconSize}
                      onChange={(e) => {
                        setIconSize(e.target.value as any);
                        addNotification({
                          type: 'success',
                          title: 'Icon Size Changed',
                          message: `Desktop icons set to ${e.target.value}`,
                          duration: 2000,
                        });
                      }}
                    >
                      <option value="small" className="bg-black/30">Small (64px)</option>
                      <option value="medium" className="bg-black/30">Medium (80px)</option>
                      <option value="large" className="bg-black/30">Large (96px)</option>
                    </select>
                    <p className="text-white/40 text-xs mt-1">Adjust desktop icon size</p>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Icon Arrangement</label>
                    <select
                      className={cn(selectClass, 'cursor-not-allowed opacity-60')}
                      defaultValue="manual"
                      disabled
                    >
                      <option value="manual" className="bg-black/30">Manual</option>
                      <option value="auto-grid" className="bg-black/30">Auto Grid</option>
                      <option value="auto-align" className="bg-black/30">Auto Align</option>
                    </select>
                    <p className="text-white/40 text-xs mt-1">Coming soon: Control how icons are arranged</p>
                  </div>

                  <label className={cn(rowClass, 'cursor-not-allowed opacity-50')}>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      disabled
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Grid3x3 className="w-4 h-4 text-tertiary-300" />
                        <span className="text-white font-medium">Snap to Grid</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        Coming soon: Automatically snap icons to grid when dragging
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Performance Settings */}
              <div className={panelClass}>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Zap className="w-5 h-5" />
                  Performance & Effects
                </h3>
                <div className="space-y-3">
                  <label className={cn(rowClass, 'cursor-pointer hover:bg-os-ink-800')}>
                    <input
                      type="checkbox"
                      checked={systemPreferences.windowAnimations}
                      onChange={(e) => {
                        setWindowAnimations(e.target.checked);
                        addNotification({
                          type: 'info',
                          title: 'Window Animations',
                          message: e.target.checked ? 'Animations enabled' : 'Animations disabled',
                          duration: 2000,
                        });
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Wind className="w-4 h-4 text-primary-400" />
                        <span className="text-white font-medium">Window Animations</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        Enable smooth window open/close animations
                      </p>
                    </div>
                  </label>

                  <label className={cn(rowClass, 'cursor-not-allowed opacity-50')}>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      disabled
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Sparkles className="w-4 h-4 text-fg-warning" />
                        <span className="text-white font-medium">Visual Effects</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        Coming soon: Enable blur effects and shadows
                      </p>
                    </div>
                  </label>

                  <label className={cn(rowClass, 'cursor-not-allowed opacity-50')}>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      disabled
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Gauge className="w-4 h-4 text-fg-success" />
                        <span className="text-white font-medium">Performance Mode</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        Coming soon: Disable animations for better performance
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Startup Apps */}
              <div className={panelClass}>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Power className="w-5 h-5" />
                  Startup Applications
                </h3>
                <p className="text-white/40 text-sm mb-4">
                  Configure which applications open automatically when GenOS starts
                </p>
                <div className="space-y-2 opacity-50">
                  <div className="flex items-center justify-between p-3 bg-os-ink-950/70 border border-os-line-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icons.Folder className="w-4 h-4 text-primary-400" />
                      <span className="text-white text-sm">Archive</span>
                    </div>
                    <input type="checkbox" disabled className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-os-ink-950/70 border border-os-line-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icons.User className="w-4 h-4 text-tertiary-300" />
                      <span className="text-white text-sm">About Me</span>
                    </div>
                    <input type="checkbox" disabled className="w-4 h-4" />
                  </div>
                  <p className="text-white/40 text-xs mt-2">Coming soon: Manage startup applications</p>
                </div>
              </div>

              <div className={panelClass}>
                <div className="flex items-start gap-4">
                  <Icons.Settings className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">System Customization Available</h4>
                    <p className="text-white/60 text-sm leading-relaxed mb-2">
                      <strong className="text-primary-400">Now Active:</strong> Taskbar positioning & size, desktop icon sizing, window animations, and auto-hide taskbar.
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      <strong className="text-secondary-400">Coming Soon:</strong> Icon arrangement modes, visual effects controls, performance mode, and startup applications manager.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <>
              {isAdmin ? (
                <>
                  <div className={panelClass}>
                    <h3 className="text-xl font-semibold text-white mb-4">Contact Visibility</h3>
                    <p className="text-white/40 text-sm mb-4">
                      Control what contact information is publicly visible on your portfolio.
                    </p>
                    <div className="space-y-4">
                      <label className={cn(rowClass, 'cursor-pointer hover:bg-os-ink-800')}>
                        <input
                          type="checkbox"
                          checked={preferences.showEmail}
                          onChange={(e) => setPreferences({ ...preferences, showEmail: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icons.Mail className="w-4 h-4 text-primary-400" />
                            <span className="text-white font-medium">Show Email Address</span>
                          </div>
                          <p className="text-white/40 text-xs mt-1">
                            Display your email on the Contact tab and public profiles
                          </p>
                        </div>
                      </label>

                      <label className={cn(rowClass, 'cursor-pointer hover:bg-os-ink-800')}>
                        <input
                          type="checkbox"
                          checked={preferences.showPhone}
                          onChange={(e) => setPreferences({ ...preferences, showPhone: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icons.Phone className="w-4 h-4 text-fg-success" />
                            <span className="text-white font-medium">Show Phone Number</span>
                          </div>
                          <p className="text-white/40 text-xs mt-1">
                            Display your phone number on the Contact tab and public profiles
                          </p>
                        </div>
                      </label>

                      <Button variant="soft-system-primary" size="sm" onClick={handlePreferencesSave}>
                        <Icons.Save className="w-4 h-4 mr-2" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </div>

                  <div className={panelClass}>
                    <div className="flex items-start gap-4">
                      <Icons.ShieldCheck className="w-6 h-6 text-fg-success flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">Privacy & Security</h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          All your data is stored locally in your browser. No information is sent to external servers.
                          You have complete control over your privacy settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={cn(panelClass, 'text-center')}>
                  <Icons.Lock className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
                  <p className="text-white/40 text-sm">
                    Please sign in as admin to manage privacy settings.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <>
              {isAdmin ? (
                <>
                  <div className={panelClass}>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Icons.Download className="w-5 h-5" />
                      Export Profile
                    </h3>
                    <p className="text-white/40 text-sm mb-4">
                      Download your complete profile data as JSON. Use this to backup your portfolio or transfer it to another device.
                    </p>
                    <Button variant="soft-system-primary" size="md" onClick={handleExport}>
                      <Icons.Download className="w-4 h-4 mr-2" />
                      Export Profile JSON
                    </Button>
                  </div>

                  <div className={panelClass}>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Icons.Upload className="w-5 h-5" />
                      Import Profile
                    </h3>
                    <p className="text-white/40 text-sm mb-4">
                      Upload a previously exported profile JSON file to restore your portfolio data.
                    </p>
                    <label className="inline-block">
                      <Button variant="soft-system-secondary" size="md">
                        <Icons.Upload className="w-4 h-4 mr-2" />
                        Choose File to Import
                      </Button>
                      <input
                        type="file"
                        accept="application/json,.json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                    <p className="text-white/30 text-xs mt-2">
                      Importing will replace your current profile data
                    </p>
                  </div>

                  <div className={panelClass}>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Icons.RotateCcw className="w-5 h-5" />
                      Reset Profile
                    </h3>
                    <p className="text-white/40 text-sm mb-4">
                      Reset your profile to default values. This will erase all your custom data.
                    </p>
                    <Button variant="soft-system-secondary" size="md" onClick={handleReset} className="text-fg-error border-stroke-error/40 hover:bg-error-subtle">
                      <Icons.Trash2 className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                    <p className="text-fg-error text-xs mt-2 font-medium">
                      ⚠️ Warning: This action cannot be undone
                    </p>
                  </div>

                  <div className={panelClass}>
                    <div className="flex items-start gap-4">
                      <Icons.AlertCircle className="w-6 h-6 text-fg-warning flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">Data Management</h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          Regularly export your profile to keep a backup. Imported data must match the expected format.
                          Always verify your backup after exporting.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={cn(panelClass, 'text-center')}>
                  <Icons.Lock className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
                  <p className="text-white/40 text-sm">
                    Please sign in as admin to manage data settings.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
