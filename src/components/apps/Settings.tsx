import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useDesktopStore } from '../../store/desktopStore';
import { Button } from '../ui/button';

type TabType = 'profile' | 'appearance' | 'privacy' | 'data';

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { profile, updatePersonal, updatePreferences, exportProfile, importProfile, resetProfile } = useUserStore();
  const { openWindow, apps } = useDesktopStore();

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
    alert('Profile updated successfully!');
  };

  const handlePreferencesSave = () => {
    updatePreferences(preferences);
    alert('Preferences saved successfully!');
  };

  const handleExport = () => {
    const data = exportProfile();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_profile_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Profile exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importProfile(json);
      if (success) {
        alert('Profile imported successfully! Please refresh the page to see changes.');
        // Reset local state
        setQuickEdit({
          name: profile.personal.name,
          title: profile.personal.title
        });
        setPreferences({ ...profile.preferences });
      } else {
        alert('Failed to import profile. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your profile to defaults? This cannot be undone.')) {
      resetProfile();
      alert('Profile reset successfully! Please refresh the page.');
    }
  };

  const openAboutApp = () => {
    const aboutApp = apps.find(app => app.id === 'about');
    if (aboutApp) {
      openWindow(aboutApp);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Icons.Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your portfolio settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 px-6 py-3 border-b border-white/10 bg-white/5">
        <Button
          variant={activeTab === 'profile' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('profile')}
        >
          <Icons.User className="w-4 h-4 mr-2" />
          Profile
        </Button>
        <Button
          variant={activeTab === 'appearance' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('appearance')}
        >
          <Icons.Palette className="w-4 h-4 mr-2" />
          Appearance
        </Button>
        <Button
          variant={activeTab === 'privacy' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('privacy')}
        >
          <Icons.Shield className="w-4 h-4 mr-2" />
          Privacy
        </Button>
        <Button
          variant={activeTab === 'data' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('data')}
        >
          <Icons.Database className="w-4 h-4 mr-2" />
          Data
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white/10 backdrop-blur-lg rounded p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Edit</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Update your basic information quickly here, or open the About Me app for full profile editing.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Name</label>
                    <input
                      type="text"
                      value={quickEdit.name}
                      onChange={(e) => setQuickEdit({ ...quickEdit, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-2 block">Title</label>
                    <input
                      type="text"
                      value={quickEdit.title}
                      onChange={(e) => setQuickEdit({ ...quickEdit, title: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="primary" size="sm" onClick={handleQuickSave}>
                      <Icons.Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="secondary" size="sm" onClick={openAboutApp}>
                      <Icons.ExternalLink className="w-4 h-4 mr-2" />
                      Edit Full Profile
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-900/30 to-tertiary-900/30 backdrop-blur-lg rounded p-6 border border-primary-500/20">
                <div className="flex items-start gap-4">
                  <Icons.Info className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Profile Information</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Your profile data is stored locally in your browser and automatically saved.
                      Use the Data tab to export a backup or import profile data from another device.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <>
              <div className="bg-white/10 backdrop-blur-lg rounded p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Font Size</label>
                    <select
                      value={preferences.fontSize}
                      onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value as 'sm' | 'md' | 'lg' })}
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                    >
                      <option value="sm" className="bg-slate-800">Small</option>
                      <option value="md" className="bg-slate-800">Medium</option>
                      <option value="lg" className="bg-slate-800">Large</option>
                    </select>
                    <p className="text-slate-400 text-xs mt-1">Change the base font size for better readability</p>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={preferences.accentColor || '#667eea'}
                        onChange={(e) => setPreferences({ ...preferences, accentColor: e.target.value })}
                        className="w-16 h-10 rounded border border-white/20 cursor-pointer"
                      />
                      <span className="text-slate-300 text-sm">
                        {preferences.accentColor || '#667eea'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">Customize the theme accent color</p>
                  </div>

                  <Button variant="primary" size="sm" onClick={handlePreferencesSave}>
                    <Icons.Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-tertiary-900/30 to-tertiary-700/30 backdrop-blur-lg rounded p-6 border border-tertiary-500/20">
                <div className="flex items-start gap-4">
                  <Icons.Sparkles className="w-6 h-6 text-tertiary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Theme Customization</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Appearance changes are applied immediately. More customization options coming soon!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <>
              <div className="bg-white/10 backdrop-blur-lg rounded p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Contact Visibility</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Control what contact information is publicly visible on your portfolio.
                </p>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={preferences.showEmail}
                      onChange={(e) => setPreferences({ ...preferences, showEmail: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">Show Email Address</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Display your email on the Contact tab and public profiles
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={preferences.showPhone}
                      onChange={(e) => setPreferences({ ...preferences, showPhone: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icons.Phone className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">Show Phone Number</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Display your phone number on the Contact tab and public profiles
                      </p>
                    </div>
                  </label>

                  <Button variant="primary" size="sm" onClick={handlePreferencesSave}>
                    <Icons.Save className="w-4 h-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-lg rounded p-6 border border-green-500/20">
                <div className="flex items-start gap-4">
                  <Icons.ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Privacy & Security</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      All your data is stored locally in your browser. No information is sent to external servers.
                      You have complete control over your privacy settings.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <>
              <div className="bg-white/10 backdrop-blur-lg rounded p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Download className="w-5 h-5" />
                  Export Profile
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Download your complete profile data as JSON. Use this to backup your portfolio or transfer it to another device.
                </p>
                <Button variant="primary" size="md" onClick={handleExport}>
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Export Profile JSON
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Upload className="w-5 h-5" />
                  Import Profile
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Upload a previously exported profile JSON file to restore your portfolio data.
                </p>
                <label className="inline-block">
                  <Button variant="secondary" size="md">
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
                <p className="text-slate-500 text-xs mt-2">
                  Importing will replace your current profile data
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.RotateCcw className="w-5 h-5" />
                  Reset Profile
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Reset your profile to default values. This will erase all your custom data.
                </p>
                <Button variant="danger" size="md" onClick={handleReset}>
                  <Icons.Trash2 className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <p className="text-red-400 text-xs mt-2 font-medium">
                  ⚠️ Warning: This action cannot be undone
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-lg rounded p-6 border border-orange-500/20">
                <div className="flex items-start gap-4">
                  <Icons.AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Data Management</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Regularly export your profile to keep a backup. Imported data must match the expected format.
                      Always verify your backup after exporting.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
