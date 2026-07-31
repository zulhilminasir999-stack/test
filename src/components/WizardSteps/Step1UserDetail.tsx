import React from 'react';
import { ClaimFormData } from '../../types';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface Step1UserDetailProps {
  formData: ClaimFormData;
  updateFormData: (updates: Partial<ClaimFormData>) => void;
  onNext: () => void;
  onReset: () => void;
}

export function Step1UserDetail({ formData, updateFormData, onNext, onReset }: Step1UserDetailProps) {
  const [submitted, setSubmitted] = React.useState(false);

  const isNamaValid = formData.nama.trim().length > 0;
  const isNoTenteraValid = formData.noTentera.trim().length > 0;

  const handleClear = () => {
    onReset();
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isNamaValid || !isNoTenteraValid) {
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full" id="step1-form">
      {/* Main Form Fields Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 my-2 sm:my-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">
            Maklumat Pemohon
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Sila masukkan maklumat peribadi anda
          </p>
        </div>

        <div className="space-y-5">
          {/* Nama Penuh */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
              Nama Penuh <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              id="input-nama"
              placeholder="Contoh: MEJAR AHMAD IZWAN BIN MANSOR"
              value={formData.nama}
              onChange={(e) => updateFormData({ nama: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 text-base md:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 ${
                submitted && !isNamaValid
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            />
            {submitted && !isNamaValid && (
              <p className="text-xs text-red-600 font-semibold mt-1">Sila isi Nama Penuh</p>
            )}
          </div>

          {/* ID / No. Tentera */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
              No. Tentera / ID Anggota <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              id="input-no-tentera"
              placeholder="Contoh: 3010542"
              value={formData.noTentera}
              onChange={(e) => updateFormData({ noTentera: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 text-base md:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold placeholder:text-xs placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 ${
                submitted && !isNoTenteraValid
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            />
            {submitted && !isNoTenteraValid && (
              <p className="text-xs text-red-600 font-semibold mt-1">Sila isi No. Tentera / ID Anggota</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Action Footer */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2.5 border border-orange-200 bg-white hover:bg-orange-50/50 text-orange-800 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Kosongkan
        </button>

        <button
          type="submit"
          id="btn-step1-next"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          Seterusnya
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
