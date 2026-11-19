import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  const { notification, clearNotification } = useApp();

  if (!notification) return null;

  const bgStyles = {
    success: 'bg-white border-[#86EFAC] text-[#172B20] shadow-lg shadow-green-900/5',
    warning: 'bg-white border-[#FDE68A] text-[#172B20] shadow-lg shadow-amber-900/5',
    error: 'bg-white border-[#FECACA] text-[#172B20] shadow-lg shadow-red-900/5',
    info: 'bg-white border-[#BAE6FD] text-[#172B20] shadow-lg shadow-sky-900/5'
  }[notification.type] || 'bg-white border-[#E2EAE2] text-[#172B20] shadow-lg';

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0284C7] shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${bgStyles}`}>
        {icons[notification.type]}
        <div className="text-xs font-semibold flex-1 leading-snug">{notification.message}</div>
        <button
          onClick={clearNotification}
          className="text-[#647568] hover:text-[#172B20] p-1 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
