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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[15000] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md flex flex-col mx-auto"
        >
          {/* Top gradient accent line */}
          <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

          <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-lg flex items-center justify-center">
                  <Icons.Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GenOS Admin</h2>
                  <p className="text-gray-400 text-sm">Enter credentials to access admin features</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                type="button"
              >
                <Icons.X className="w-5 h-5" />
              </Button>
            </div>

            {/* Gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600/50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="admin@genos.dev"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-lg border border-gray-600/50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter admin password"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <Icons.EyeOff className="w-5 h-5" />
                    ) : (
                      <Icons.Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <Icons.AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>



              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 w-full flex items-center justify-center gap-2"
                >
                  <Icons.LogIn className="w-4 h-4" />
                  Login
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1 w-full flex items-center justify-center gap-2"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {/* Gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-6" />

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icons.Shield className="w-4 h-4" />
              <p>Admin features are protected to prevent unauthorized modifications</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
