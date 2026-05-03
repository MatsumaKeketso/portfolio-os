import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('admin@genos.dev');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    const { success, error: loginError } = await login(password, email);

    if (success) {
      setPassword('');
      setError('');
      onClose();
    } else {
      setError(loginError || 'Invalid credentials. Please try again.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[15000] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-os-ink-950 rounded-lg border border-white/[0.08] shadow-os-window overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-os-ink-800 rounded flex items-center justify-center border border-white/[0.08]">
                <Icons.Lock className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Admin Login</h2>
                <p className="text-white/40 text-xs">Enter credentials to access admin features</p>
              </div>
            </div>
            <Button variant="ink-ghost" size="icon" onClick={handleClose} type="button">
              <Icons.X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/60 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-os-ink-800 text-white placeholder-white/30 px-3 py-2 rounded border border-white/[0.08] text-sm focus:outline-none focus:border-white/[0.20]"
                placeholder="admin@genos.dev"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-os-ink-800 text-white placeholder-white/30 px-3 py-2 pr-10 rounded border border-white/[0.08] text-sm focus:outline-none focus:border-white/[0.20]"
                  placeholder="Enter admin password"
                />
                <Button
                  variant="ink-ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7"
                >
                  {showPassword ? <Icons.EyeOff className="w-3.5 h-3.5" /> : <Icons.Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <Icons.AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="ink"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleSubmit}
              >
                <Icons.LogIn className="w-3.5 h-3.5" />
                Login
              </Button>
              <Button type="button" variant="ink-ghost" size="sm" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-4 flex items-center gap-2 text-xs text-white/30">
            <Icons.Shield className="w-3.5 h-3.5" />
            <p>Admin features are protected to prevent unauthorized modifications</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
