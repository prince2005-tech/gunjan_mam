import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const btnColors = {
    danger: 'bg-[#DC2626] hover:bg-red-700 text-white',
    primary: 'bg-[#16834A] hover:bg-[#136F3F] text-white',
    warning: 'bg-[#D97706] hover:bg-amber-700 text-white'
  }[confirmVariant] || 'bg-[#16834A] hover:bg-[#136F3F] text-white';

  const iconColors = {
    danger: 'bg-red-50 text-[#DC2626] border-red-200',
    primary: 'bg-green-50 text-[#15803D] border-green-200',
    warning: 'bg-amber-50 text-[#D97706] border-amber-200'
  }[confirmVariant] || 'bg-green-50 text-[#15803D] border-green-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E2EAE2] rounded-2xl shadow-xl max-w-md w-full p-6 text-[#172B20]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${iconColors}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B20]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#647568] hover:text-[#172B20] p-1 rounded-lg hover:bg-[#F5F8F5] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[#526658] leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-[#526658] bg-[#F5F8F5] hover:bg-[#E2EAE2] rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition ${btnColors}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
