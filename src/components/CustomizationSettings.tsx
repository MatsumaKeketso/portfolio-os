import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from './ui/button';
import { uploadFiles, UploadProgress as UploadProgressType } from '../lib/uploadUtils';
import { UploadProgress } from './UploadProgress';

interface CustomizationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizationSettings({ isOpen, onClose }: CustomizationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'profile' | 'appearance'>('desktop');
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const {
    backgrounds,
    selectedBackgroundId,
    setSelectedBackground,
    addBackground,
    removeBackground,
    resetBackgroundToDefault,
  } = useDesktopStore();
  const { profile, updatePreferences } = useUserStore();
  const {
    theme,
    presets,
    updateColors,
    setBorderRadius,
    setSpacing,
    setIconStyle,
    applyPreset,
    resetToDefault,
  } = useThemeStore();

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log(`Processing ${files.length} file(s)`);
    setIsUploading(true);
    setUploadProgress([]);

    try {
      // Upload files to Supabase
      const results = await uploadFiles(files, {
        folder: 'backgrounds',
        maxSizeMB: 5,
        allowedTypes: ['image/*'],
        onProgress: (progress) => {
          setUploadProgress((prev) => {
            const existing = prev.findIndex((p) => p.fileName === progress.fileName);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = progress;
              return updated;
            }
            return [...prev, progress];
          });
        },
      });

      // Add successfully uploaded backgrounds to the store
      results.forEach((result) => {
        if (result.url && !result.error) {
          const fileName = result.fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
          const newBackground = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            url: result.url,
            thumbnail: result.url,
          };

          console.log('Adding background:', newBackground.name);
          addBackground(newBackground);
        }
      });

      const successCount = results.filter((r) => !r.error).length;
      if (successCount > 0) {
        console.log(`Successfully uploaded ${successCount} background${successCount > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`Error uploading files: ${error}`);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[15000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col mx-auto"
          >
            <div className="flex-1 bg-background-chrome rounded-lg border border-os-line-dark shadow-os-window overflow-hidden flex flex-col">
              {/* Header */}
              <div className="shrink-0 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Icons.Palette className="w-6 h-6 text-primary-400" />
                    Customization Settings
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    Personalize your PortfolioOS experience
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                >
                  <Icons.X className="w-6 h-6" />
                </Button>
              </div>

              <div className="h-px bg-os-line-dark" />

              {/* Tabs */}
              <div className="shrink-0 px-6 py-3 bg-os-ink-900 flex gap-2">
                <Button
                  onClick={() => setActiveTab('desktop')}
                  variant={activeTab === 'desktop' ? 'solid-brand-primary' : 'soft-system-primary'}
                  size="sm"
                >
                  <Icons.Monitor className="w-4 h-4 inline mr-2" />
                  Desktop
                </Button>
                <Button
                  onClick={() => setActiveTab('appearance')}
                  variant={activeTab === 'appearance' ? 'solid-brand-primary' : 'soft-system-primary'}
                  size="sm"
                >
                  <Icons.Sparkles className="w-4 h-4 inline mr-2" />
                  Appearance
                </Button>
                <Button
                  onClick={() => setActiveTab('profile')}
                  variant={activeTab === 'profile' ? 'solid-brand-primary' : 'soft-system-primary'}
                  size="sm"
                >
                  <Icons.User className="w-4 h-4 inline mr-2" />
                  Profile
                </Button>
              </div>

              <div className="h-px bg-os-line-dark" />

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Upload Progress */}
                {uploadProgress.length > 0 && (
                  <div className="mb-4">
                    <UploadProgress
                      uploads={uploadProgress}
                      onClose={() => setUploadProgress([])}
                    />
                  </div>
                )}

                {/* Desktop Tab */}
                {activeTab === 'desktop' && (
                  <div>
                    <div>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Icons.Image className="w-5 h-5 text-primary-400" />
                            Background Wallpapers
                          </h3>

                          {/* Upload Button */}
                          <div className="mb-4">
                            <label className={`bg-os-ink-800 hover:bg-os-ink-700 border border-os-line-dark text-white px-6 py-3 rounded flex items-center justify-center gap-2 transition-all font-semibold ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                              {isUploading ? (
                                <>
                                  <Icons.Loader className="w-5 h-5 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Icons.Upload className="w-5 h-5" />
                                  Upload Custom Background
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleBackgroundUpload}
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                            <p className="text-white/40 text-sm text-center mt-2">
                              Upload JPG, PNG, or WebP images (max 5MB per file, multiple files supported)
                            </p>
                          </div>

                          {/* Background Grid */}
                          <div className="grid grid-cols-3 gap-4">
                            {backgrounds.map((bg) => {
                              const isSelected = selectedBackgroundId === bg.id;
                              const isDefault = bg.id.startsWith('default-');
                              const isGradient = bg.url.startsWith('linear-gradient');

                              return (
                                <div
                                  key={bg.id}
                                  className={`relative rounded overflow-hidden border-2 transition-all cursor-pointer group ${isSelected
                                    ? 'border-primary-500'
                                    : 'border-os-line-dark hover:border-os-line-light'
                                    }`}
                                  onClick={() => setSelectedBackground(bg.id)}
                                >
                                  {/* Background Preview */}
                                  <div
                                    className="w-full h-24 bg-cover bg-center"
                                    style={{
                                      background: isGradient ? bg.url : 'transparent',
                                      backgroundImage: !isGradient ? `url(${bg.url})` : undefined,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center'
                                    }}
                                  />

                                  {/* Info Bar */}
                                  <div className="bg-os-ink-900 p-2 border-t border-os-line-dark flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <h3 className="text-white font-semibold text-xs truncate">
                                        {bg.name}
                                      </h3>
                                      {isSelected && (
                                        <Icons.Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                      )}
                                    </div>

                                    {/* Delete button for custom backgrounds */}
                                    {!isDefault && (
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Delete "${bg.name}"?`)) {
                                            removeBackground(bg.id);
                                          }
                                        }}
                                        variant="ghost-danger"
                                        size="icon"
                                        className="w-6 h-6 opacity-0 group-hover:opacity-100"
                                        title="Delete background"
                                      >
                                        <Icons.Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-4 border-t border-os-line-dark">
                      <Button
                        onClick={resetBackgroundToDefault}
                        variant="soft-system-primary"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Icons.RotateCcw className="w-4 h-4" />
                        Reset to Default Background
                      </Button>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    {/* Theme Presets */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Sparkles className="w-5 h-5 text-primary-400" />
                        Theme Presets
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {presets.map((preset) => {
                          const isActive = theme.colors.primary === preset.theme.colors.primary;
                          return (
                            <Button
                              key={preset.name}
                              onClick={() => applyPreset(preset.name)}
                              variant={isActive ? 'solid-brand-primary' : 'soft-system-primary'}
                              className="p-4 h-auto hover:scale-105"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="w-6 h-6 rounded-full ring-1 ring-white/15"
                                  style={{ backgroundColor: preset.theme.colors.primary }}
                                />
                                <div
                                  className="w-6 h-6 rounded-full ring-1 ring-white/10 opacity-70"
                                  style={{ backgroundColor: preset.theme.colors.primary, filter: 'brightness(1.4)' }}
                                />
                                <div
                                  className="w-6 h-6 rounded-full ring-1 ring-white/10 opacity-70"
                                  style={{ backgroundColor: preset.theme.colors.primary, filter: 'brightness(0.6)' }}
                                />
                              </div>
                              <div className="text-white font-semibold text-sm">{preset.name}</div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Brand Color — single hex drives the whole ramp */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Palette className="w-5 h-5 text-primary-400" />
                        Brand Color
                      </h3>
                      <div className="bg-os-ink-900 border border-os-line-dark rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme.colors.primary}
                            onChange={(e) => updateColors({ primary: e.target.value })}
                            className="w-12 h-12 rounded cursor-pointer border-2 border-os-line-light"
                          />
                          <div className="flex-1">
                            <p className="text-white font-semibold mb-1">Brand</p>
                            <p className="text-white/40 text-xs font-mono">{theme.colors.primary}</p>
                          </div>
                        </div>
                        {/* Live ramp preview: tints → brand → shades */}
                        <div className="mt-4 flex h-7 overflow-hidden rounded">
                          {(['50','200','400','600','800','1000','1300','1700','2100'] as const).map((stop) => (
                            <div
                              key={stop}
                              className="flex-1"
                              style={{ backgroundColor: `rgb(var(--brand-${stop}))` }}
                              title={`brand-${stop}`}
                            />
                          ))}
                        </div>
                        <p className="text-white/40 text-xs mt-2">
                          The full tint/shade range is generated from this one color.
                        </p>
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.RectangleHorizontal className="w-5 h-5 text-primary-400" />
                        Border Radius
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                        {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
                          <Button
                            key={radius}
                            onClick={() => setBorderRadius(radius)}
                            variant={theme.borderRadius === radius ? 'solid-brand-primary' : 'soft-system-primary'}
                            className="p-4 h-auto"
                            style={{
                              borderRadius: radius === 'none' ? '0' : radius === 'sm' ? '0.375rem' : radius === 'md' ? '0.5rem' : radius === 'lg' ? '0.75rem' : '1rem'
                            }}
                          >
                            <div className="font-semibold text-xs uppercase">{radius}</div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Spacing */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Maximize2 className="w-5 h-5 text-primary-400" />
                        Spacing
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(['compact', 'normal', 'comfortable'] as const).map((spacing) => (
                          <Button
                            key={spacing}
                            onClick={() => setSpacing(spacing)}
                            variant={theme.spacing === spacing ? 'solid-brand-primary' : 'soft-system-primary'}
                            className="p-4 h-auto flex-col"
                          >
                            <div className="font-semibold mb-1 capitalize">{spacing}</div>
                            <div className="text-xs opacity-70">
                              {spacing === 'compact' ? 'Dense layout' : spacing === 'normal' ? 'Balanced spacing' : 'Generous spacing'}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Icon Style */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Box className="w-5 h-5 text-primary-400" />
                        Icon Style
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(['default', 'rounded', 'sharp'] as const).map((style) => (
                          <Button
                            key={style}
                            onClick={() => setIconStyle(style)}
                            variant={theme.iconStyle === style ? 'solid-brand-primary' : 'soft-system-primary'}
                            className="p-4 h-auto flex-col"
                          >
                            <Icons.Square
                              className={`w-8 h-8 mx-auto mb-2 ${style === 'rounded' ? 'rounded-full' : style === 'sharp' ? '' : 'rounded-lg'
                                }`}
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '8px',
                              }}
                            />
                            <div className="font-semibold text-sm capitalize">{style}</div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-4 border-t border-os-line-dark">
                      <Button
                        onClick={resetToDefault}
                        variant="soft-system-primary"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Icons.RotateCcw className="w-4 h-4" />
                        Reset to Default Theme
                      </Button>
                    </div>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.User className="w-5 h-5 text-primary-400" />
                        Quick Profile Info
                      </h3>
                      <div className="bg-os-ink-900 rounded p-4 border border-os-line-dark">
                        <div className="flex items-center gap-4 mb-4">
                          {profile.personal.photo ? (
                            <img
                              src={profile.personal.photo}
                              alt={profile.personal.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-primary-400"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-os-ink-800 border border-os-line-dark flex items-center justify-center">
                              <Icons.User className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-semibold text-lg">{profile.personal.name}</p>
                            <p className="text-primary-300">{profile.personal.title}</p>
                          </div>
                        </div>
                        <div className="text-white/60 text-sm space-y-2">
                          <p><Icons.MapPin className="w-4 h-4 inline mr-2 text-primary-400" />{profile.personal.location}</p>
                          {profile.preferences.showEmail && profile.personal.email && (
                            <p><Icons.Mail className="w-4 h-4 inline mr-2 text-primary-400" />{profile.personal.email}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-white/40 text-sm mt-3">
                        To edit your full profile, open the <strong className="text-primary-400">About</strong> app or <strong className="text-primary-400">Settings</strong> app from the desktop.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Shield className="w-5 h-5 text-primary-400" />
                        Privacy Settings
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-os-ink-900 border border-os-line-dark rounded cursor-pointer hover:bg-os-ink-800 transition-all">
                          <input
                            type="checkbox"
                            checked={profile.preferences.showEmail}
                            onChange={(e) => updatePreferences({ showEmail: e.target.checked })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">Show Email Address</p>
                            <p className="text-white/40 text-sm">Display email in Contact app</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-os-ink-900 border border-os-line-dark rounded cursor-pointer hover:bg-os-ink-800 transition-all">
                          <input
                            type="checkbox"
                            checked={profile.preferences.showPhone}
                            onChange={(e) => updatePreferences({ showPhone: e.target.checked })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">Show Phone Number</p>
                            <p className="text-white/40 text-sm">Display phone in Contact app</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div >
      )
      }
    </AnimatePresence >
  );
}
