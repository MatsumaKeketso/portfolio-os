import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import generativeStudioLogo from '../assets/png-white-symbol.png';
import { AppIcon } from '../lib/AppIcon';
import { useDesktopStore } from '../store/desktopStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { App } from '../types';
import { CustomizationSettings } from './CustomizationSettings';
import { LoginModal } from './LoginModal';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { SystemRow, SystemRowGroup, SystemRowDivider } from './ui/SystemRow';
import { ContextMenuItemDef, ContextPermission, MenuGroup, resolveAndSort } from '../lib/contextMenuRegistry';

const toContextMenuItems = (defs: ContextMenuItemDef[], permissions: ContextPermission[]): ContextMenuItem[] =>
  resolveAndSort(defs, permissions).map((item) => ({
    label: item.label,
    icon: item.icon,
    onClick: item.action,
    disabled: item.disabled,
    danger: item.danger,
    divider: item.divider,
    shortcut: item.shortcut,
  }));

// ---------------------------------------------------------------------------
// App grouping
// ---------------------------------------------------------------------------

const SYSTEM_APP_IDS = new Set([
  'file-explorer', 'settings', 'about-os',
  'task-manager', 'calculator', 'notepad', 'weather',
]);

type AppGroup = 'system' | 'work' | 'projects';

function getAppGroup(app: App): AppGroup {
  if (SYSTEM_APP_IDS.has(app.id)) return 'system';
  if (app.projectStatus) return 'projects';
  return 'work';
}

const GROUP_LABELS: Record<AppGroup, string> = {
  system: 'System',
  work: 'Work',
  projects: 'Projects',
};

const GROUP_ORDER: AppGroup[] = ['work', 'projects', 'system'];

// ---------------------------------------------------------------------------
// Icon helper — 24×24 app icon for the SystemRow icon slot
// ---------------------------------------------------------------------------

function StartMenuAppIcon({ app }: { app: App }) {
  return (
    <span className="w-5 h-5 rounded bg-os-ink-800 flex items-center justify-center flex-shrink-0">
      <AppIcon icon={app.icon} customIcon={app.customIcon} className="w-3 h-3 text-white/80" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StartMenuProps {
  anchor?: { bottom: number; centerX: number };
}

export function StartMenu({ anchor }: StartMenuProps = {}) {
  const { apps, isStartMenuOpen, openWindow, setStartMenuOpen, isAdminMode, updateApp, setAdminEditTarget } =
    useDesktopStore();
  const { isAuthenticated, isAdmin, role, user, logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [appMenu, setAppMenu] = useState<{ app: App; x: number; y: number } | null>(null);

  const handleOpenApp = (app: App) => {
    openWindow(app);
    setStartMenuOpen(false);
    setSearchQuery('');
  };

  const handleAppContextMenu = (e: React.MouseEvent, app: App) => {
    e.preventDefault();
    e.stopPropagation();
    setAppMenu({ app, x: e.clientX, y: e.clientY });
  };

  const confirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    setStartMenuOpen(false);
  };

  // Permissions available in the StartMenu context — 'admin' covers the
  // superuser when Admin Mode is on; everyone gets 'visitor'.
  const menuPermissions: ContextPermission[] = [
    'visitor',
    ...(isAuthenticated ? ['owner' as ContextPermission] : []),
    ...(isAdmin && isAdminMode ? ['admin' as ContextPermission] : []),
  ];

  const getAppMenuDefs = (app: App): ContextMenuItemDef[] => [
    {
      id: 'open',
      label: 'Open',
      icon: Icons.ExternalLink,
      group: 'primary',
      action: () => handleOpenApp(app),
    },
    {
      id: 'pin-taskbar',
      label: app.pinnedToTaskbar ? 'Unpin from Taskbar' : 'Pin to Taskbar',
      icon: app.pinnedToTaskbar ? Icons.PinOff : Icons.Pin,
      group: 'organize',
      action: () => updateApp(app.id, { pinnedToTaskbar: !app.pinnedToTaskbar }),
    },
    {
      id: 'pin-desktop',
      label: app.pinnedToDesktop ? 'Unpin from Desktop' : 'Pin to Desktop',
      icon: app.pinnedToDesktop ? Icons.MonitorOff : Icons.Monitor,
      group: 'organize',
      action: () => updateApp(app.id, { pinnedToDesktop: !app.pinnedToDesktop }),
    },
    {
      id: 'app-info',
      label: 'App Info',
      icon: Icons.Info,
      group: 'system' as MenuGroup,
      action: () => {
        addNotification({
          type: 'info',
          title: app.name,
          message: [
            app.description,
            app.defaultSize ? `${app.defaultSize.width}×${app.defaultSize.height}` : null,
          ].filter(Boolean).join(' — '),
          duration: 6000,
        });
      },
    },
    {
      id: 'edit-admin',
      label: 'Edit in Admin',
      icon: Icons.Settings,
      group: 'system' as MenuGroup,
      requires: ['admin'],
      action: () => {
        const adminApp = apps.find(a => a.id === 'admin-panel');
        if (adminApp) {
          setAdminEditTarget(app.id);
          openWindow(adminApp);
        }
        setStartMenuOpen(false);
      },
    },
  ];

  // Determine which apps to show
  const searchActive = searchQuery.trim().length > 0;
  const filteredApps = searchActive
    ? apps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  // Group apps for non-search view
  const groupedApps = GROUP_ORDER.reduce<Record<AppGroup, App[]>>(
    (acc, g) => {
      acc[g] = apps.filter((a) => getAppGroup(a) === g);
      return acc;
    },
    { system: [], work: [], projects: [] },
  );

  return (
    <AnimatePresence>
      {isStartMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={() => setStartMenuOpen(false)}
          />

          {/* Menu panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="fixed w-[340px] z-[9999] flex flex-col"
            style={{
              bottom: anchor ? anchor.bottom : 76,
              left: anchor
                ? Math.max(8, Math.min(anchor.centerX - 170, window.innerWidth - 348))
                : Math.max(8, window.innerWidth / 2 - 170),
              maxHeight: 'calc(100vh - 100px)',
            }}
          >
            <div
              className="flex flex-col overflow-hidden rounded-lg"
              style={{
                background: 'rgb(var(--os-ink-900) / 1)',
                border: '1px solid var(--os-line-dark)',
                boxShadow: '0 18px 50px rgba(0,0,0,0.42), 0 4px 16px rgba(0,0,0,0.28)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: '1px solid var(--os-line-dark)' }}
              >
                <div className="flex items-center gap-2">
                  <img src={generativeStudioLogo} alt="" className="w-[18px] h-[18px] object-contain" />
                  <span className="text-[12px] font-semibold text-white tracking-wide">
                    GenOS
                  </span>
                </div>
                <button
                  onClick={() => setStartMenuOpen(false)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 pt-3 pb-1">
                <div className="relative">
                  <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-os-ink-800 border border-os-line-dark rounded-md pl-8 pr-3 py-1.5 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-stroke-brand transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* App list */}
              <div className="flex-1 overflow-y-auto py-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                {searchActive ? (
                  // Flat search results
                  filteredApps!.length > 0 ? (
                    <>
                      <SystemRowGroup context="chrome">Results</SystemRowGroup>
                      {filteredApps!.map((app) => (
                        <SystemRow
                          key={app.id}
                          icon={<StartMenuAppIcon app={app} />}
                          label={app.name}
                          description={app.description}
                          context="chrome"
                          onClick={() => handleOpenApp(app)}
                          onContextMenu={(e) => handleAppContextMenu(e, app)}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center text-[12px] text-white/25">
                      No apps match "{searchQuery}"
                    </div>
                  )
                ) : (
                  // Grouped view
                  GROUP_ORDER.map((group) => {
                    const groupApps = groupedApps[group];
                    if (groupApps.length === 0) return null;
                    return (
                      <div key={group}>
                        <SystemRowGroup context="chrome">{GROUP_LABELS[group]}</SystemRowGroup>
                        {groupApps.map((app) => (
                          <SystemRow
                            key={app.id}
                            icon={<StartMenuAppIcon app={app} />}
                            label={app.name}
                            description={app.description}
                            context="chrome"
                            badge={
                              app.projectStatus === 'featured'
                                ? 'Featured'
                                : app.projectStatus === 'live'
                                  ? 'Live'
                                  : app.projectStatus === 'wip'
                                    ? 'WIP'
                                    : undefined
                            }
                            onClick={() => handleOpenApp(app)}
                            onContextMenu={(e) => handleAppContextMenu(e, app)}
                          />
                        ))}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <SystemRowDivider context="chrome" className="mx-0 my-0" />
              <div className="relative flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className={`relative w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isAdmin
                      ? 'bg-primary-500/15 border-primary-500/35'
                      : isAuthenticated
                        ? 'bg-success-subtle border-stroke-success/40'
                        : 'bg-os-ink-800 border-transparent'
                  }`}>
                    <Icons.User className={`w-3 h-3 ${
                      isAdmin ? 'text-primary-300' : isAuthenticated ? 'text-fg-success' : 'text-white/50'
                    }`} />
                    {isAuthenticated && (
                      <span className={`absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full border border-background-chrome ${
                        isAdmin ? 'bg-primary-400' : 'bg-fg-success'
                      }`} />
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[11px] text-white/70">
                      {isAdmin ? 'Keketso' : isAuthenticated ? user?.email || 'Guest' : 'Visitor'}
                    </div>
                    {isAdmin && isAdminMode ? (
                      <div className="text-[10px] text-fg-success">Superuser mode on</div>
                    ) : (
                      <div className="text-[10px] text-white/25">
                        {role === 'guest' ? 'Guest session' : isAdmin ? 'Superuser' : 'View only'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setShowCustomization(true)}
                    title="Appearance"
                    className="w-7 h-7 flex items-center justify-center rounded text-white/35 hover:bg-os-ink-800 hover:text-white/70 transition-colors"
                  >
                    <Icons.Palette className="w-3.5 h-3.5" />
                  </button>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      title="Logout"
                      className="w-7 h-7 flex items-center justify-center rounded text-white/35 hover:bg-error-subtle hover:text-fg-error transition-colors"
                    >
                      <Icons.LogOut className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowLoginModal(true)}
                      title="Sign In"
                      className="w-7 h-7 flex items-center justify-center rounded text-white/35 hover:bg-os-ink-800 hover:text-white/70 transition-colors"
                    >
                      <Icons.LogIn className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {showLogoutConfirm && (
                    <>
                      <button
                        className="fixed inset-0 z-[10000] cursor-default"
                        aria-label="Cancel sign out"
                        onClick={() => setShowLogoutConfirm(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-2 bottom-11 z-[10001] w-64 rounded-lg border border-os-line-dark bg-background-chrome shadow-os-window p-3"
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 w-6 h-6 rounded-full bg-primary-500/15 border border-primary-500/25 flex items-center justify-center shrink-0">
                            <Icons.HelpCircle className="w-3.5 h-3.5 text-primary-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white/85">Sign out?</div>
                            <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                              Your current OS session will close. Public content remains visible.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="rounded px-2.5 py-1.5 text-xs text-white/55 hover:bg-os-ink-800 hover:text-white/80 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmLogout}
                            className="rounded bg-primary-500 px-2.5 py-1.5 text-xs font-semibold text-os-ink-950 hover:bg-primary-400 transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Studio credit */}
              <div
                className="text-center py-1"
                style={{ borderTop: '1px solid var(--os-line-dark)' }}
              >
                <span className="text-[10px] text-white/15">Built by Generative Studio</span>
              </div>
            </div>
          </motion.div>

          {/* App context menu */}
          <AnimatePresence>
            {appMenu && (
              <ContextMenu
                x={appMenu.x}
                y={appMenu.y}
                items={toContextMenuItems(getAppMenuDefs(appMenu.app), menuPermissions)}
                onClose={() => setAppMenu(null)}
              />
            )}
          </AnimatePresence>

          <CustomizationSettings
            isOpen={showCustomization}
            onClose={() => setShowCustomization(false)}
          />

          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
