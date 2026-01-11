import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomizationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizationSettings({ isOpen, onClose }: CustomizationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'profile' | 'appearance'>('desktop');
  const {
    backgrounds,
    selectedBackgroundId,
    setSelectedBackground,
    addBackground,
    removeBackground,
    resetBackgroundToDefault,
    isAdminMode,
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

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log(`Processing ${files.length} file(s)`);

    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB)`);
        return;
      }

      console.log(`Reading file ${index + 1}: ${file.name}`);

      const reader = new FileReader();

      reader.onerror = () => {
        console.error(`Failed to read file: ${file.name}`);
        alert(`Failed to read ${file.name}. Please try again.`);
      };

      reader.onload = (event) => {
        try {
          const dataUrl = event.target?.result as string;

          if (!dataUrl) {
            console.error('No data URL generated');
            alert(`Failed to process ${file.name}`);
            return;
          }

          const newBackground = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            url: dataUrl,
            thumbnail: dataUrl
          };

          console.log('Adding background:', newBackground.name);
          addBackground(newBackground);
          console.log('Background added successfully:', newBackground.name);

          // Show success message only for the last file
          if (index === files.length - 1) {
            alert(`Successfully uploaded ${files.length} background${files.length > 1 ? 's' : ''}!`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          alert(`Error processing ${file.name}: ${error}`);
        }
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[15000] flex items-center justify-center p-4"
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
            {/* Top gradient accent line */}
            <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

            <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="shrink-0 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Icons.Palette className="w-6 h-6 text-primary-400" />
                    Customization Settings
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">
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

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Tabs */}
              <div className="shrink-0 px-6 py-3 bg-white/5 flex gap-2">
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

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
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
                            <label className="bg-gradient-to-r from-primary-500 to-tertiary-500 hover:from-primary-600 hover:to-tertiary-600 text-white px-6 py-3 rounded flex items-center justify-center gap-2 transition-all font-semibold cursor-pointer">
                              <Icons.Upload className="w-5 h-5" />
                              Upload Custom Background
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleBackgroundUpload}
                                className="hidden"
                              />
                            </label>
                            <p className="text-gray-400 text-sm text-center mt-2">
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
                                  className={`relative rounded overflow-hidden border-4 transition-all cursor-pointer group ${isSelected
                                    ? 'border-primary-500 shadow-lg shadow-primary-500/50'
                                    : 'border-gray-700 hover:border-gray-500'
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
                                  <div className="bg-gray-900/80 backdrop-blur-sm p-2 border-t border-white/10 flex items-center justify-between">
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
                    <div className="pt-4 border-t border-gray-700">
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
                        {presets.map((preset) => (
                          <Button
                            key={preset.name}
                            onClick={() => applyPreset(preset.name)}
                            variant="soft-system-primary"
                            className="p-4 h-auto hover:scale-105"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: preset.theme.colors.primary }}
                              />
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: preset.theme.colors.secondary }}
                              />
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: preset.theme.colors.tertiary }}
                              />
                            </div>
                            <div className="text-white font-semibold text-sm">{preset.name}</div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Color Customization */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Palette className="w-5 h-5 text-primary-400" />
                        Custom Colors
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(['primary', 'secondary', 'tertiary', 'accent'] as const).map((colorKey) => (
                          <div key={colorKey} className="bg-white/5 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={theme.colors[colorKey]}
                                onChange={(e) => updateColors({ [colorKey]: e.target.value })}
                                className="w-12 h-12 rounded cursor-pointer border-2 border-gray-600"
                              />
                              <div className="flex-1">
                                <p className="text-white font-semibold capitalize mb-1">{colorKey}</p>
                                <p className="text-gray-400 text-xs font-mono">{theme.colors[colorKey]}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                    <div className="pt-4 border-t border-gray-700">
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
                      <div className="bg-white/5 rounded p-4 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                          {profile.personal.photo ? (
                            <img
                              src={profile.personal.photo}
                              alt={profile.personal.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-primary-400"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-tertiary-600 flex items-center justify-center">
                              <Icons.User className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-semibold text-lg">{profile.personal.name}</p>
                            <p className="text-primary-300">{profile.personal.title}</p>
                          </div>
                        </div>
                        <div className="text-gray-300 text-sm space-y-2">
                          <p><Icons.MapPin className="w-4 h-4 inline mr-2 text-primary-400" />{profile.personal.location}</p>
                          {profile.preferences.showEmail && profile.personal.email && (
                            <p><Icons.Mail className="w-4 h-4 inline mr-2 text-primary-400" />{profile.personal.email}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-3">
                        To edit your full profile, open the <strong className="text-primary-400">About</strong> app or <strong className="text-primary-400">Settings</strong> app from the desktop.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Shield className="w-5 h-5 text-primary-400" />
                        Privacy Settings
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-all">
                          <input
                            type="checkbox"
                            checked={profile.preferences.showEmail}
                            onChange={(e) => updatePreferences({ showEmail: e.target.checked })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">Show Email Address</p>
                            <p className="text-gray-400 text-sm">Display email in Contact app</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-all">
                          <input
                            type="checkbox"
                            checked={profile.preferences.showPhone}
                            onChange={(e) => updatePreferences({ showPhone: e.target.checked })}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">Show Phone Number</p>
                            <p className="text-gray-400 text-sm">Display phone in Contact app</p>
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
