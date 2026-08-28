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

    // Convert file to Base64 data URL for instant offline/browser preview & storage
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Current Receipt Preview */}
          {currentUrl ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative group">
              {currentUrl.startsWith('data:application/pdf') ? (
                <div className="p-8 text-center">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">مستند PDF محمل</p>
                  <a
                    href={currentUrl}
                    download="receipt.pdf"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل المستند</span>
                  </a>
                </div>
              ) : (
                <div className="relative max-h-80 overflow-hidden flex items-center justify-center bg-black/5">
                  <img
                    src={currentUrl}
                    alt="Receipt preview"
                    className="max-h-72 object-contain w-full"
                  />
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 left-3 p-2 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="فتح الصورة بحجم كامل"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
              <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">لا يوجد إيصال مرفق حالياً</p>
              <p className="text-xs text-slate-400 mt-1">
                يمكنك التقاط صورة بالكاميرا أو اختيار صورة/PDF من الموبايل
              </p>
            </div>
          )}

          {/* Upload / Replace Controls */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {currentUrl ? 'استبدال الإيصال' : 'رفع إيصال جديد (كاميرا / الاستوديو)'}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم اختيار الإيصال بنجاح! انقر حفظ للاعتماد</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {uploading ? 'جاري الرفع...' : 'حفظ الإيصال'}
          </button>
        </div>
      </div>
    </div>
  );
}
