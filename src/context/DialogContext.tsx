import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Info, X } from 'lucide-react';

type DialogType = 'alert' | 'confirm';

interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const showAlert = (title: string, message: string) => {
    setDialog({ title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText: string = 'Ya, Lanjutkan') => {
    setDialog({ title, message, type: 'confirm', onConfirm, confirmText });
  };

  const closeDialog = () => setDialog(null);

  const handleConfirm = () => {
    if (dialog?.onConfirm) dialog.onConfirm();
    closeDialog();
  };

  const handleCancel = () => {
    if (dialog?.onCancel) dialog.onCancel();
    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${dialog.type === 'confirm' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {dialog.type === 'confirm' ? <AlertTriangle size={24} /> : <Info size={24} />}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight mb-2">
                      {dialog.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {dialog.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3 justify-end items-center">
                {dialog.type === 'confirm' && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors ${
                    dialog.type === 'confirm' 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {dialog.type === 'confirm' ? dialog.confirmText : 'Mengerti'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};
