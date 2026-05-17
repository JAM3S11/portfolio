import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDarkMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDarkMode,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const overlay = isDarkMode ? 'bg-black/60' : 'bg-black/40';
  const surface = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const border = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay}`}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl ${surface} border ${border} shadow-2xl overflow-hidden`}
          >
            <div className="flex items-start gap-4 p-5 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
              }`}>
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${textPrimary}`}>{title}</h3>
                <p className={`text-sm mt-1 ${textMuted}`}>{message}</p>
              </div>
              <button onClick={onCancel} className={`p-1 rounded-lg ${textMuted} hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <X size={16} />
              </button>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${border}`}>
              <button
                onClick={onCancel}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
