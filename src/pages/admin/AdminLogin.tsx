import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  password: string;
  onPasswordChange: (v: string) => void;
  isLoading: boolean;
  onLogin: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export default function AdminLogin({
  password,
  onPasswordChange,
  isLoading,
  onLogin,
  onBack,
  isDarkMode,
}: AdminLoginProps) {
  const bg = isDarkMode ? 'bg-gray-950' : 'bg-gray-50';
  const surface = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDarkMode
    ? 'bg-gray-800 text-white placeholder-gray-500'
    : 'bg-gray-100 text-gray-900 placeholder-gray-400';

  return (
    <div className={`min-h-screen flex items-center justify-center ${bg} px-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`w-full max-w-sm ${surface} rounded-3xl shadow-2xl overflow-hidden`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div
              className={`w-16 h-16 rounded-2xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'} flex items-center justify-center mb-4 ring-1 ${isDarkMode ? 'ring-blue-500/20' : 'ring-blue-200'}`}
            >
              <Lock size={26} className="text-blue-500" />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${textPrimary}`}>Admin</h1>
            <p className={`text-sm mt-1 ${textMuted}`}>Secure access required</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Password (default: admin123)"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl ${inputBg} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            />
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? 'Verifying\u2026' : 'Continue'}
            </button>
          </form>

          <button
            onClick={onBack}
            className={`w-full mt-3 py-3 rounded-xl text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'} transition-colors`}
          >
            {'\u2190'} Back to Portfolio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
