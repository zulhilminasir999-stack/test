import React, { useState } from 'react';
import { RateConfig } from '../types';
import defaultRates from '../data/rates.json';
import { X, Settings, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface RatesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: RateConfig;
  onUpdateConfig: (newConfig: RateConfig) => void;
}

export function RatesSettingsModal({
  isOpen,
  onClose,
  currentConfig,
  onUpdateConfig,
}: RatesSettingsModalProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(currentConfig, null, 2));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText) as RateConfig;
      if (!parsed.mileageRates || !parsed.rankRates) {
        throw new Error('Struktur JSON tidak lengkap. Sila pastikan mileageRates & rankRates wujud.');
      }
      onUpdateConfig(parsed);
      setErrorMsg(null);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sintaks JSON tidak sah.');
    }
  };

  const handleResetToDefault = () => {
    const formatted = JSON.stringify(defaultRates, null, 2);
    setJsonText(formatted);
    onUpdateConfig(defaultRates as RateConfig);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tetapan Kadar Tuntutan JSON</h3>
              <p className="text-xs text-slate-300">
                Kemaskini parameter kadar pekeliling tanpa menyentuh kod sumber.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              Tetapan kadar berjaya dikemaskini secara masa nyata!
            </div>
          )}

          <p className="text-xs text-slate-600">
            Edit struktur data JSON di bawah untuk mengubah suai kadar tuntutan KM, elaun harian,
            makan, hotel, atau lojing mengikut pangkat dan kawasan (W1/W2):
          </p>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={18}
            className="w-full  text-xs p-4 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Set Semula ke Kadar Asal
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20"
            >
              Simpan Tetapan Kadar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
