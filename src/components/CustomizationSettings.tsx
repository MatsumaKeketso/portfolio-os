import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';

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
  } = useDesktopStore();
  const { profile, updatePreferences } = useUserStore();

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
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <Icons.X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Tabs */}
              <div className="shrink-0 px-6 py-3 bg-white/5 flex gap-2">
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={`px-4 py-2 rounded transition-all ${
                    activeTab === 'desktop'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Icons.Monitor className="w-4 h-4 inline mr-2" />
                  Desktop
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`px-4 py-2 rounded transition-all ${
                    activeTab === 'appearance'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Icons.Sparkles className="w-4 h-4 inline mr-2" />
                  Appearance
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded transition-all ${
                    activeTab === 'profile'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Icons.User className="w-4 h-4 inline mr-2" />
                  Profile
                </button>
              </div>

              {/* Gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Desktop Tab */}
                {activeTab === 'desktop' && (
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
                              className={`relative rounded overflow-hidden border-4 transition-all cursor-pointer group ${
                                isSelected
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Delete "${bg.name}"?`)) {
                                        removeBackground(bg.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-red-500 rounded transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete background"
                                  >
                                    <Icons.Trash2 className="w-3 h-3 text-white" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Type className="w-5 h-5 text-primary-400" />
                        Text Size
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(['sm', 'md', 'lg'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updatePreferences({ fontSize: size })}
                            className={`p-4 rounded border-2 transition-all ${
                              profile.preferences.fontSize === size
                                ? 'border-primary-500 bg-primary-500/20'
                                : 'border-gray-700 hover:border-gray-500 bg-white/5'
                            }`}
                          >
                            <div className="text-white font-semibold mb-1">
                              {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                            </div>
                            <div className={`text-gray-400 ${
                              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
                            }`}>
                              Sample Text
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Icons.Palette className="w-5 h-5 text-primary-400" />
                        Accent Color
                      </h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={profile.preferences.accentColor || '#667eea'}
                          onChange={(e) => updatePreferences({ accentColor: e.target.value })}
                          className="w-16 h-16 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-white mb-1">Current: {profile.preferences.accentColor || '#667eea'}</p>
                          <p className="text-gray-400 text-sm">Choose your preferred accent color for buttons and highlights</p>
                        </div>
                      </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
