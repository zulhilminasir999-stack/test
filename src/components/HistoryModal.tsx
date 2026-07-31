import React, { useState, useEffect } from 'react';
import { SavedClaimRecord } from '../types';
import { formatMYR } from '../utils/calculator';
import { X, History, Trash2, ExternalLink, Calendar, User, FileText, Car } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecord: (record: SavedClaimRecord) => void;
}

export function HistoryModal({ isOpen, onClose, onLoadRecord }: HistoryModalProps) {
  const [history, setHistory] = useState<SavedClaimRecord[]>([]);

  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const savedStr = localStorage.getItem('atm_travel_claim_history') || '[]';
        setHistory(JSON.parse(savedStr));
        setConfirmClear(false);
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    localStorage.removeItem('atm_travel_claim_history');
    setHistory([]);
    setConfirmClear(false);
  };

  const handleDeleteOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem('atm_travel_claim_history', JSON.stringify(updated));
    setHistory(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sejarah Tuntutan Tersimpan</h3>
              <p className="text-xs text-slate-300">
                Rekod pengiraan tuntutan perjalanan yang telah disimpan dalam peranti ini.
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
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Tiada Rekod Sejarah Tersimpan</p>
              <p className="text-[11px]">Anda boleh menyimpan sebarang pengiraan di Langkah 4 (Rumusan).</p>
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  onLoadRecord(record);
                  onClose();
                }}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all cursor-pointer flex flex-wrap justify-between items-center gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                      {record.formData.nama || 'Tanpa Nama'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">
                      {record.formData.noTentera || 'No ID'}
                    </span>
                    <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                      {record.formData.pangkat}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      {record.formData.jenisKenderaan} ({record.formData.jumlahKm} KM)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(record.savedAt).toLocaleDateString('ms-MY')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">JUMLAH TUNTUTAN</span>
                    <span className="text-base font-black text-orange-600">
                      {formatMYR(record.result.grandTotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteOne(record.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Padam rekod ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          {history.length > 0 ? (
            <button
              type="button"
              onClick={handleClearHistory}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                confirmClear 
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear ? 'Pasti Mahu Padam Semua? Klik Sekali Lagi' : 'Padam Semua Rekod'}
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
