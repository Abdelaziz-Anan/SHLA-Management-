'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Camera, Eye, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  onSaveReceipt: (url: string) => void;
  title?: string;
}

export function ReceiptModal({
  isOpen,
  onClose,
  receiptUrl,
  onSaveReceipt,
  title = 'إيصال العملية المالية',
}: ReceiptModalProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(receiptUrl || '');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCurrentUrl(result);
      setUploading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveReceipt(currentUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-slide-up duration-300">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between">
          <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Current Receipt Preview */}
          {currentUrl ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 relative group">
              {currentUrl.startsWith('data:application/pdf') ? (
                <div className="p-6 sm:p-8 text-center">
                  <FileText className="w-14 h-14 text-rose-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">مستند PDF محمل</p>
                  <a
                    href={currentUrl}
                    download="receipt.pdf"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل المستند</span>
                  </a>
                </div>
              ) : (
                <div className="relative max-h-72 overflow-hidden flex items-center justify-center bg-black/5">
                  <img
                    src={currentUrl}
                    alt="Receipt preview"
                    className="max-h-64 object-contain w-full"
                  />
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 left-3 p-2 bg-slate-900/80 text-white rounded-xl opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    title="فتح الصورة بالحجم الكامل"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50">
              <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">لا يوجد إيصال مرفق حالياً</p>
              <p className="text-xs text-slate-400 mt-1">
                يمكنك التقاط صورة بالكاميرا أو اختيار صورة/PDF من الموبايل
              </p>
            </div>
          )}

          {/* Upload / Replace Controls */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {currentUrl ? 'استبدال الإيصال' : 'رفع إيصال جديد (كاميرا / الاستوديو)'}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>تم اختيار الإيصال بنجاح! انقر حفظ للاعتماد</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={handleSave}
            className="px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 active:scale-98"
          >
            {uploading ? 'جاري الرفع...' : 'حفظ الإيصال'}
          </button>
        </div>
      </div>
    </div>
  );
}
