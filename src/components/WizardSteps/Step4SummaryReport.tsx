import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { ClaimFormData, ClaimCalculationResult } from '../../types';
import { formatMYR, calculateTravelDuration } from '../../utils/calculator';
import {
  Download,
  Printer,
  RotateCcw,
  User,
  Car,
  Receipt,
  Wallet,
  ArrowLeft,
} from 'lucide-react';

interface Step4SummaryReportProps {
  formData: ClaimFormData;
  result: ClaimCalculationResult;
  onPrev: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
}

export function Step4SummaryReport({
  formData,
  result,
  onPrev,
  onReset,
}: Step4SummaryReportProps) {
  const { userBreakdown, driverBreakdown, grandTotal } = result;
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const durationInfo = calculateTravelDuration(
    formData.tarikhMula,
    formData.masaMula || '08:00',
    formData.tarikhTamat,
    formData.masaTamat || '08:00'
  );

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('official-statement-report');
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
      const opt = {
        margin: 10,
        filename: `Rumusan_Tuntutan_${formData.nama ? formData.nama.replace(/\s+/g, '_') : 'Anggota'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to print if download fails (e.g. in sandbox)
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 w-full my-2 sm:my-3" id="step4-container">
      {/* Top Main Container for Print & View */}
      <div id="official-statement-report" className="space-y-6">
        {/* Header Section */}
        <div className="bg-[#FFF5EB] border border-orange-100 rounded-2xl p-6 sm:p-7 shadow-2xs">
          <h2 className="text-xl sm:text-2xl font-bold text-[#7C2D12]">
            Rumusan Tuntutan
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#C2410C] mt-1">
            Semak semula maklumat tuntutan anda
          </p>
        </div>

        {/* Card 1: Maklumat Pengguna */}
        <div className="bg-white border border-orange-100/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Maklumat Pengguna & Perjalanan
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Nama Penuh</span>
              <span className="font-bold text-slate-900 text-sm uppercase">{formData.nama || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">ID Tentera</span>
              <span className="font-bold text-slate-900 text-sm">{formData.noTentera || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Pangkat</span>
              <span className="font-bold text-slate-900 text-sm">{formData.pangkat}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Jenis Kenderaan</span>
              <span className="font-bold text-slate-900 text-sm">{formData.jenisKenderaan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Jumlah KM</span>
              <span className="font-bold text-slate-900 text-sm">{formData.jumlahKm} KM (Pergi & Balik: {(formData.jumlahKm || 0) * 2} KM)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Kawasan</span>
              <span className="font-bold text-slate-900 text-sm">{formData.kawasan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Mula Perjalanan</span>
              <span className="font-bold text-slate-900 text-sm">
                {formData.tarikhMula} ({formData.masaMula || '08:00'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Tamat Perjalanan</span>
              <span className="font-bold text-slate-900 text-sm">
                {formData.tarikhTamat} ({formData.masaTamat || '08:00'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Tempoh Perjalanan</span>
              <span className="font-bold text-slate-900 text-sm block">
                {durationInfo.formattedDuration || '0 jam'} ({durationInfo.totalHours.toFixed(1)}j)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pecahan Tuntutan Pengguna */}
        <div className="bg-[#EFF6FF] border border-blue-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="border-b border-blue-200/60 pb-3">
            <h3 className="text-sm font-bold text-blue-950">
              Pecahan Tuntutan Pengguna
            </h3>
          </div>

          <div className="divide-y divide-blue-200/60 text-xs">
            {/* Tuntutan KM */}
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Tuntutan KM (Pergi & Balik)</span>
                <span className="text-slate-500 text-[11px]">
                  {formData.gunaPemandu ? (
                    <span className="text-amber-700 font-semibold">* Pemandu disediakan (Tiada tuntutan KM)</span>
                  ) : (
                    <>
                      {userBreakdown.totalEffectiveKm || ((formData.jumlahKm || 0) * 2)} KM ({formData.jumlahKm} KM x 2) - {formData.jenisKenderaan}
                      {userBreakdown.mileageFirst500Km > 0 && userBreakdown.mileageAbove500Km === 0 ? ` (0-500km @ RM${userBreakdown.mileageFirst500Rate.toFixed(2)}/km)` : ''}
                      {userBreakdown.mileageAbove500Km > 0 ? ` (500km @ RM${userBreakdown.mileageFirst500Rate.toFixed(2)} + ${userBreakdown.mileageAbove500Km}km @ RM${userBreakdown.mileageAbove500Rate.toFixed(2)})` : ''}
                    </>
                  )}
                </span>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                {formatMYR(userBreakdown.mileageTotalAmount)}
              </span>
            </div>

            {/* Elaun Harian */}
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Elaun Harian</span>
                <span className="text-slate-500 text-[11px]">
                  {userBreakdown.dailyAllowanceDays} Hari x {formatMYR(userBreakdown.dailyAllowanceRate)} ({formData.kawasan})
                </span>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                {formatMYR(userBreakdown.dailyAllowanceAmount)}
              </span>
            </div>

            {/* Elaun Makan */}
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Elaun Makan</span>
                <span className="text-slate-500 text-[11px]">
                  {userBreakdown.mealAllowanceDays} Hari x {formatMYR(userBreakdown.mealAllowanceRate)} ({formData.kawasan})
                </span>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                {formatMYR(userBreakdown.mealAllowanceAmount)}
              </span>
            </div>

            {/* Penginapan Hotel (if nights > 0 or if both are 0) */}
            {(userBreakdown.hotelNights > 0 || userBreakdown.lojingNights === 0) && (
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Hotel</span>
                  <span className="text-slate-500 text-[11px]">
                    {userBreakdown.hotelNights} Malam x {formatMYR(userBreakdown.hotelRate)} ({formData.kawasan})
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMYR(userBreakdown.hotelAmount)}
                </span>
              </div>
            )}

            {/* Elaun Lojing (if nights > 0) */}
            {userBreakdown.lojingNights > 0 && (
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Elaun Lojing</span>
                  <span className="text-slate-500 text-[11px]">
                    {userBreakdown.lojingNights} Malam x {formatMYR(userBreakdown.lojingRate)} ({formData.kawasan})
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMYR(userBreakdown.lojingAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Blue Total Box */}
          <div className="bg-blue-100/90 p-3.5 rounded-xl flex justify-between items-center font-bold text-blue-950 text-xs sm:text-sm">
            <span>Jumlah Kecil Pengguna</span>
            <span className="text-blue-900 text-base font-bold">{formatMYR(userBreakdown.subtotal)}</span>
          </div>
        </div>

        {/* Card 3: Pecahan Tuntutan Pemandu (If Guna Pemandu) */}
        {formData.gunaPemandu && (
          <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="border-b border-emerald-200/60 pb-3">
              <h3 className="text-sm font-bold text-emerald-950">
                Pecahan Tuntutan Pemandu
              </h3>
            </div>

            {/* Green Nota Banner */}
            <div className="bg-emerald-100/80 p-3 rounded-xl text-xs text-emerald-900 font-medium">
              <strong>Nota:</strong> Tuntutan harian & makan pemandu menggunakan kadar <strong>Pbt – PW1</strong>. Kadar penginapan adalah sama seperti pengguna.
            </div>

            <div className="divide-y divide-emerald-200/60 text-xs">
              {/* Tuntutan KM */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Tuntutan KM (Pergi & Balik)</span>
                  <span className="text-emerald-800 font-medium text-[11px]">
                    * Pemandu disediakan (Tiada tuntutan KM)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMYR(driverBreakdown.mileageTotalAmount)}
                </span>
              </div>

              {/* Elaun Harian */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Elaun Harian</span>
                  <span className="text-slate-500 text-[11px]">
                    {driverBreakdown.dailyAllowanceDays} Hari x {formatMYR(driverBreakdown.dailyAllowanceRate)} ({formData.kawasan})
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMYR(driverBreakdown.dailyAllowanceAmount)}
                </span>
              </div>

              {/* Elaun Makan */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Elaun Makan</span>
                  <span className="text-slate-500 text-[11px]">
                    {driverBreakdown.mealAllowanceDays} Hari x {formatMYR(driverBreakdown.mealAllowanceRate)} ({formData.kawasan})
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMYR(driverBreakdown.mealAllowanceAmount)}
                </span>
              </div>

              {/* Penginapan */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Penginapan</span>
                  <span className="text-slate-500 text-[11px]">
                    {driverBreakdown.accommodationNights} Malam x {formatMYR(driverBreakdown.accommodationRate)} (Kadar sama pengguna)
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMYR(driverBreakdown.accommodationAmount)}
                </span>
              </div>

              <p className="py-2 text-[11px] italic text-emerald-800 font-medium">
                {driverBreakdown.isAccommodationProvided
                  ? '* Penginapan pemandu telah disediakan (Tiada tuntutan penginapan)'
                  : '* Kadar penginapan pemandu disamakan mengikut kelayakan penginapan pengguna'}
              </p>
            </div>

            {/* Green Total Box */}
            <div className="bg-emerald-100 p-3.5 rounded-xl flex justify-between items-center font-bold text-emerald-950 text-xs sm:text-sm">
              <span>Jumlah Kecil Pemandu</span>
              <span className="text-emerald-900 text-base font-bold">{formatMYR(driverBreakdown.subtotal)}</span>
            </div>
          </div>
        )}

        {/* Card 4: JUMLAH TUNTUTAN PERJALANAN */}
        <div className="bg-[#FFF5EB] border border-orange-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xs">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#7C2D12] uppercase tracking-wider">
            JUMLAH TUNTUTAN PERJALANAN
          </h3>

          <div className="text-4xl sm:text-5xl font-black text-[#C2410C]">
            {formatMYR(grandTotal)}
          </div>

          <div className="border-t border-orange-200/80 pt-3.5 text-xs text-slate-600 font-medium">
            Tuntutan Pengguna: <span className="font-bold text-slate-900">{formatMYR(userBreakdown.subtotal)}</span>
            {formData.gunaPemandu && (
              <>
                {' '}+ Tuntutan Pemandu: <span className="font-bold text-slate-900">{formatMYR(driverBreakdown.subtotal)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons at Bottom */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden w-full">
        <button
          type="button"
          id="btn-step4-prev"
          onClick={onPrev}
          className="px-4 py-2 border border-orange-200 bg-white hover:bg-orange-50/50 text-orange-800 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        <button
          type="button"
          id="btn-step4-new-claim"
          onClick={onReset}
          className="px-4 py-2 rounded-xl border border-orange-200 bg-white hover:bg-orange-50/60 text-orange-800 font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
          Tuntutan Baharu
        </button>

        <button
          type="button"
          id="btn-print-report"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="ml-auto px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGeneratingPdf ? 'Memuat turun...' : 'Muat Turun PDF'}
        </button>
      </div>
    </div>
  );
}

