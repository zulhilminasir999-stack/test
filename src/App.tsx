import React, { useState } from 'react';
import {
  ClaimFormData,
  RateConfig,
  SavedClaimRecord,
} from './types';
import defaultRateConfig from './data/rates.json';
import { calculateClaim, formatMYR } from './utils/calculator';

import { Step1UserDetail } from './components/WizardSteps/Step1UserDetail';
import { Step2TravelDetail } from './components/WizardSteps/Step2TravelDetail';
import { Step3DriverDetail } from './components/WizardSteps/Step3DriverDetail';
import { Step4SummaryReport } from './components/WizardSteps/Step4SummaryReport';
import { SmoothScroll } from './components/SmoothScroll';

import { RatesModal } from './components/RatesModal';
import { HistoryModal } from './components/HistoryModal';
import { RatesSettingsModal } from './components/RatesSettingsModal';

import {
  Check,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const initialFormData: ClaimFormData = {
  // Step 1
  nama: '',
  noTentera: '',
  perkhidmatan: 'Tentera Darat',
  unit: '',
  tarikhMula: '',
  tarikhTamat: '',
  masaMula: '',
  masaTamat: '',
  tujuan: '',
  destinasi: '',

  // Step 2
  pangkat: '',
  jenisKenderaan: '',
  jumlahKm: 0,
  bayaranTol: 0,
  kawasan: '',
  bilHariElaunHarian: 0,
  bilHariElaunMakan: 0,
  bilMalamPenginapan: 0,
  jenisPenginapan: '',
  bilMalamHotel: 0,
  bilMalamLojing: 0,
  jumlahHargaHotel: 0,

  // Step 3
  gunaPemandu: false,
  namaPemandu: '',
  noTenteraPemandu: '',
  pemanduDisediakanKemudahan: false,
  jenisPenginapanPemandu: 'Hotel',
  jumlahHargaHotelPemandu: 0,
};

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<ClaimFormData>(initialFormData);
  const [rateConfig, setRateConfig] = useState<RateConfig>(defaultRateConfig as RateConfig);

  // Modals state
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Smooth scroll to top when step changes
  React.useEffect(() => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (target: number) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const updateFormData = (updates: Partial<ClaimFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => setStep((prev) => Math.min(4, prev + 1));
  const handlePrev = () => setStep((prev) => Math.max(1, prev - 1));

  const handleReset = () => {
    setFormData(initialFormData);
    setStep(1);
  };

  const handleLoadSavedRecord = (record: SavedClaimRecord) => {
    setFormData(record.formData);
    setStep(4);
  };

  // Live total for persistent bottom ticker
  const liveResult = calculateClaim(formData, rateConfig);

  const stepsList = [
    { num: 1, title: 'Maklumat Pengguna', short: 'Maklumat\nPengguna', sub: 'Nama & ID Tentera' },
    { num: 2, title: 'Perjalanan & Kelayakan', short: 'Perjalanan &\nKelayakan', sub: 'Pangkat, KM & Elaun' },
    { num: 3, title: 'Maklumat Pemandu', short: 'Maklumat\nPemandu', sub: 'Kelayakan Pemandu' },
    { num: 4, title: 'Rumusan Tuntutan', short: 'Rumusan\nTuntutan', sub: 'Penyata & Cetak' },
  ];

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white">
        {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xs relative">
        <div className="flex-1 text-center">
          <h1 className="text-sm sm:text-base font-bold text-slate-800 leading-tight uppercase tracking-tight text-center">
            KIRAAN TUNTUTAN TUGAS RASMI 2026
          </h1>
          <p className="text-xs text-slate-500 font-medium text-center">Angkatan Tentera Malaysia (ATM)</p>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3 sm:gap-6 absolute right-4 sm:right-8">
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {formData.nama.trim() ? formData.nama : 'Pemohon ATM'}
              </p>
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">
                {formData.noTentera ? `ID: ${formData.noTentera}` : 'Pegawai / Anggota'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-xs bg-gradient-to-br from-orange-400 to-orange-600 text-white shrink-0">
              {formData.nama.slice(0, 1).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Step Wizard Navigation */}
      <nav className="bg-white px-2 sm:px-6 py-2 sm:py-2.5 border-b border-slate-100 shadow-2xs">
        <div className="flex items-center w-full max-w-6xl mx-auto">
          {stepsList.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            const isLast = idx === stepsList.length - 1;

            return (
              <div key={s.num} className="flex flex-col items-center flex-1 relative">
                <button
                  type="button"
                  id={`step-indicator-${s.num}`}
                  disabled={s.num > step}
                  onClick={() => setStep(s.num)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm mb-1.5 z-10 transition-all ${
                    isCurrent
                      ? 'bg-orange-500 text-white'
                      : isCompleted
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-500 hover:bg-orange-200'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : s.num}
                </button>

                <span
                  className={`text-[9px] sm:text-[11px] font-bold tracking-wider leading-tight transition-colors text-center px-0.5 whitespace-pre-line ${
                    isCurrent
                      ? 'text-orange-600'
                      : isCompleted
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="hidden sm:inline">{s.title}</span>
                  <span className="sm:hidden">{s.short}</span>
                </span>

                {!isLast && (
                  <div
                    className={`absolute h-[2px] w-full top-3.5 sm:top-4 left-1/2 -z-0 transition-colors ${
                      step > s.num ? 'bg-orange-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 pb-20 sm:pb-32 space-y-6">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {step === 1 && (
                <Step1UserDetail
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onReset={handleReset}
                />
              )}

              {step === 2 && (
                <Step2TravelDetail
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}

              {step === 3 && (
                <Step3DriverDetail
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}

              {step === 4 && (
                <Step4SummaryReport
                  formData={formData}
                  result={liveResult}
                  onPrev={handlePrev}
                  onReset={handleReset}
                  onJumpToStep={(targetStep) => setStep(targetStep)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <RatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoadRecord={handleLoadSavedRecord}
      />

      <RatesSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentConfig={rateConfig}
        onUpdateConfig={(newCfg) => setRateConfig(newCfg)}
      />
    </div>
    </SmoothScroll>
  );
}
