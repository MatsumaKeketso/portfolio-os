import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useDesktopStore } from '../../store/desktopStore';
import { Button } from '../ui/button';
import { AppShell } from '../ui/AppShell';

export function Contact() {
  const { profile } = useUserStore();
  const { isAdmin } = useAuthStore();
  const { openWindow, apps } = useDesktopStore();

  const openAboutApp = () => {
    const aboutApp = apps.find(app => app.id === 'about');
    if (aboutApp) {
      openWindow(aboutApp);
    }
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('github')) return Icons.Github;
    if (platformLower.includes('linkedin')) return Icons.Linkedin;
    if (platformLower.includes('twitter') || platformLower.includes('x.com')) return Icons.Twitter;
    if (platformLower.includes('facebook')) return Icons.Facebook;
    if (platformLower.includes('instagram')) return Icons.Instagram;
    if (platformLower.includes('youtube')) return Icons.Youtube;
    if (platformLower.includes('discord')) return Icons.MessageCircle;
    return Icons.Link;
  };

  const socialLinks = [
    ...(profile.social.github ? [{ platform: 'GitHub', url: profile.social.github }] : []),
    ...(profile.social.linkedin ? [{ platform: 'LinkedIn', url: profile.social.linkedin }] : []),
    ...(profile.social.twitter ? [{ platform: 'Twitter', url: profile.social.twitter }] : []),
    ...(profile.social.website ? [{ platform: 'Website', url: profile.social.website }] : []),
    ...profile.social.custom.map(link => ({ platform: link.name, url: link.url }))
  ];

  return (
    <AppShell className="bg-os-ink-950/50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-os-line-dark">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icons.Mail className="w-6 h-6" />
              Contact Information
            </h1>
            <p className="text-white/40 text-sm mt-1">Get in touch</p>
          </div>

          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={openAboutApp}>
              <Icons.Edit className="w-4 h-4 mr-2" />
              Edit Contact
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-black/30 rounded p-8 border border-os-line-dark">
            <div className="flex items-start gap-6">
              {/* Photo */}
              {profile.personal.photo ? (
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-os-line-dark-hover">
                  <img
                    src={profile.personal.photo}
                    alt={profile.personal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center flex-shrink-0 border-4 border-os-line-dark-hover">
                  <Icons.User className="w-12 h-12 text-white" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-1">{profile.personal.name}</h2>
                <p className="text-xl text-fg-brand mb-3">{profile.personal.title}</p>
                {profile.personal.location && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Icons.MapPin className="w-4 h-4" />
                    <span>{profile.personal.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="bg-black/30 rounded p-6 border border-os-line-dark">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Icons.MessageSquare className="w-5 h-5" />
              Direct Contact
            </h3>

            <div className="space-y-3">
              {/* Email */}
              {profile.preferences.showEmail && profile.personal.email ? (
                <a
                  href={`mailto:${profile.personal.email}`}
                  className="flex items-center gap-4 p-4 bg-os-ink-800/40 rounded-lg hover:bg-os-ink-800/80 transition-all border border-os-line-dark hover:border-brand-600/50 group"
                >
                  <div className="w-12 h-12 bg-brand-600/20 rounded-lg flex items-center justify-center group-hover:bg-brand-600/30 transition-all">
                    <Icons.Mail className="w-6 h-6 text-fg-brand" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/40 text-sm">Email</div>
                    <div className="text-white font-medium">{profile.personal.email}</div>
                  </div>
                  <Icons.ExternalLink className="w-5 h-5 text-white/40 group-hover:text-fg-brand transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-os-ink-800/40 rounded-lg border border-os-line-dark opacity-50">
                  <div className="w-12 h-12 bg-os-ink-800/80 rounded-lg flex items-center justify-center">
                    <Icons.Mail className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/40 text-sm">Email</div>
                    <div className="text-white/30">Hidden for privacy</div>
                  </div>
                  <Icons.EyeOff className="w-5 h-5 text-white/30" />
                </div>
              )}

              {/* Phone */}
              {profile.preferences.showPhone && profile.personal.phone ? (
                <a
                  href={`tel:${profile.personal.phone}`}
                  className="flex items-center gap-4 p-4 bg-os-ink-800/40 rounded-lg hover:bg-os-ink-800/80 transition-all border border-os-line-dark hover:border-stroke-success/40 group"
                >
                  <div className="w-12 h-12 bg-success-subtle rounded-lg flex items-center justify-center group-hover:bg-success-subtle transition-all">
                    <Icons.Phone className="w-6 h-6 text-fg-success" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/40 text-sm">Phone</div>
                    <div className="text-white font-medium">{profile.personal.phone}</div>
                  </div>
                  <Icons.ExternalLink className="w-5 h-5 text-white/40 group-hover:text-fg-success transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-os-ink-800/40 rounded-lg border border-os-line-dark opacity-50">
                  <div className="w-12 h-12 bg-os-ink-800/80 rounded-lg flex items-center justify-center">
                    <Icons.Phone className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/40 text-sm">Phone</div>
                    <div className="text-white/30">Hidden for privacy</div>
                  </div>
                  <Icons.EyeOff className="w-5 h-5 text-white/30" />
                </div>
              )}
            </div>

            {(!profile.preferences.showEmail && !profile.preferences.showPhone) && (
              <div className="mt-4 p-3 bg-warning-subtle border border-stroke-warning/40 rounded-lg">
                <p className="text-fg-warning text-sm flex items-center gap-2">
                  <Icons.Info className="w-4 h-4" />
                  Direct contact methods are hidden. You can enable them in Settings.
                </p>
              </div>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="bg-black/30 rounded p-6 border border-os-line-dark">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Icons.Share2 className="w-5 h-5" />
                Social & Web
              </h3>

              <div className="grid md:grid-cols-2 gap-3">
                {socialLinks.map((link, index) => {
                  const IconComponent = getSocialIcon(link.platform);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-os-ink-800/40 rounded-lg hover:bg-os-ink-800/80 transition-all border border-os-line-dark hover:border-brand-600/50 group"
                    >
                      <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center group-hover:bg-brand-600/30 transition-all">
                        <IconComponent className="w-5 h-5 text-fg-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{link.platform}</div>
                        <div className="text-white/40 text-xs truncate">{link.url}</div>
                      </div>
                      <Icons.ExternalLink className="w-4 h-4 text-white/40 group-hover:text-fg-brand transition-colors flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.personal.bio.length > 0 && (
            <div className="bg-black/30 rounded p-6 border border-os-line-dark">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Icons.User className="w-5 h-5" />
                About
              </h3>
              <div className="space-y-3">
                {profile.personal.bio.map((paragraph, index) => (
                  <p key={index} className="text-white/60 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-black/30 rounded p-6 border border-os-line-dark">
            <div className="flex items-start gap-4">
              <Icons.MessageCircle className="w-6 h-6 text-fg-brand flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-2">Let's Connect!</h4>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  I'm always interested in hearing about new opportunities, collaborations, or just having a chat about technology and innovation.
                </p>
                <div className="flex gap-2">
                  {profile.preferences.showEmail && profile.personal.email && (
                    <Button
                      asChild
                      variant="primary"
                      size="sm"
                    >
                      <a href={`mailto:${profile.personal.email}`}>
                        <Icons.Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </a>
                    </Button>
                  )}
                  {profile.social.linkedin && (
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                    >
                      <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">
                        <Icons.Linkedin className="w-4 h-4 mr-2" />
                        Connect on LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
