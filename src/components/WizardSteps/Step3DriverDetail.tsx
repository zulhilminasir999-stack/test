import React from 'react';
import { ClaimFormData } from '../../types';
import { calculateClaim } from '../../utils/calculator';
import { SearchableDropdown } from '../SearchableDropdown';
import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface Step3DriverDetailProps {
  formData: ClaimFormData;
  updateFormData: (updates: Partial<ClaimFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3DriverDetail({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Step3DriverDetailProps) {
  const liveResult = calculateClaim(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full" id="step3-form">
      {/* Main Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-5 my-2 sm:my-3">
        {/* Container Title */}
        <div className="pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Maklumat Pemandu
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sila nyatakan status penggunaan dan kemudahan pemandu
            </p>
          </div>
        </div>

        {/* Section 1: Guna Pemandu */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Adakah perjalanan ini menggunakan pemandu? <span className="text-amber-600">*</span>
          </label>
          <SearchableDropdown<string>
            id="dropdown-guna-pemandu"
            required
            options={[
              { value: 'ya', label: 'Ya' },
              { value: 'tidak', label: 'Tidak' },
            ]}
            value={formData.gunaPemandu ? 'ya' : 'tidak'}
            onChange={(val) => updateFormData({ gunaPemandu: val === 'ya' })}
            placeholder="Pilih Status Pemandu"
          />
        </div>

        {/* Section 2: Kemudahan Pemandu (if Guna Pemandu = Ya) */}
        {formData.gunaPemandu && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Kemudahan Pemandu Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Adakah penginapan pemandu disediakan? <span className="text-amber-600">*</span>
              </label>
              <SearchableDropdown<string>
                id="dropdown-pemandu-disediakan"
                required
                options={[
                  { value: 'ya', label: 'Ya', sublabel: 'Penginapan telah disediakan' },
                  { value: 'tidak', label: 'Tidak', sublabel: 'Pemandu membayar sendiri penginapan' },
                ]}
                value={formData.pemanduDisediakanKemudahan ? 'ya' : 'tidak'}
                onChange={(val) => updateFormData({ pemanduDisediakanKemudahan: val === 'ya' })}
                placeholder="Pilih Status Penginapan Pemandu"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-[#F0FDF4] border border-emerald-200 rounded-xl p-4 space-y-2 shadow-2xs">
              {!formData.pemanduDisediakanKemudahan ? (
                <>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Penginapan Tidak Disediakan
                  </h4>
                  <p className="text-xs font-medium text-emerald-800">Kelayakan Pemandu:</p>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs font-medium text-emerald-800">
                    <li>Elaun Harian</li>
                    <li>Elaun Makan</li>
                    <li>Penginapan (kadar sama seperti anggota)</li>
                  </ul>
                  <p className="text-[11px] italic text-emerald-700/90 pt-0.5">
                    * Elaun jarak / penggunaan kenderaan tidak dikira apabila menggunakan pemandu
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Penginapan Disediakan
                  </h4>
                  <p className="text-xs font-medium text-emerald-800">Kelayakan Pemandu:</p>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs font-medium text-emerald-800">
                    <li>Elaun Harian</li>
                    <li>Elaun Makan</li>
                  </ul>
                  <p className="text-[11px] italic text-emerald-700/90 pt-0.5">
                    * Penginapan pemandu telah disediakan (Tiada tuntutan penginapan).
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          id="btn-step3-prev"
          onClick={onPrev}
          className="px-5 py-2.5 border border-orange-200 bg-white hover:bg-orange-50/50 text-orange-800 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          type="submit"
          id="btn-step3-next"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          Lihat Rumusan <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}


