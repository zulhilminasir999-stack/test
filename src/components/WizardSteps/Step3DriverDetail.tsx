import React, { useState } from 'react';
import { AccommodationType, ClaimFormData } from '../../types';
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
  const [submitted, setSubmitted] = useState(false);
  const liveResult = calculateClaim(formData);

  const driverNights = liveResult.userBreakdown.accommodationNights || formData.bilMalamPenginapan || 0;
  const getMalamString = (n: number) => (n > 0 ? `${n} Malam` : '');
  const driverHotelPlaceholderText = `Masukkan Jumlah Harga Hotel Pemandu ${getMalamString(driverNights)}`;

  const driverAccommodationOptions = [
    {
      value: 'Hotel',
      label: 'Hotel',
    },
    {
      value: 'Lojing',
      label: 'Lojing',
    },
  ];

  const currentDriverAccomType = formData.jenisPenginapanPemandu || 'Hotel';
  const isDriverHotelSelected = currentDriverAccomType === 'Hotel';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (formData.gunaPemandu && !formData.pemanduDisediakanKemudahan) {
      if (isDriverHotelSelected && driverNights > 0 && (!formData.jumlahHargaHotelPemandu || formData.jumlahHargaHotelPemandu <= 0)) {
        return;
      }
    }

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

            {/* Pemilihan Hotel / Lojing Pemandu Jika Tidak Disediakan */}
            {!formData.pemanduDisediakanKemudahan && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Pilih Jenis Penginapan Pemandu <span className="text-amber-600">*</span>
                  </label>

                  <SearchableDropdown<AccommodationType | ''>
                    id="dropdown-pemandu-penginapan"
                    required
                    hideBadge
                    hasError={submitted && !formData.jenisPenginapanPemandu}
                    options={driverAccommodationOptions}
                    value={currentDriverAccomType}
                    onChange={(val) =>
                      updateFormData({
                        jenisPenginapanPemandu: (val as AccommodationType) || 'Hotel',
                      })
                    }
                    placeholder="Pilih Jenis Penginapan Pemandu"
                  />
                  {submitted && !formData.jenisPenginapanPemandu && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      Sila pilih jenis penginapan pemandu
                    </p>
                  )}
                </div>

                {/* Harga Hotel Se-malam Input (Bagi Pilihan Hotel Pemandu) */}
                {isDriverHotelSelected && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-harga-hotel-pemandu" className="block text-xs capitalize font-bold text-slate-700 tracking-wider">
                        Masukkan Jumlah Harga Hotel Pemandu <span className="text-amber-600">*</span>
                      </label>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs md:text-sm font-medium text-slate-400 pointer-events-none">
                        RM
                      </span>
                      <input
                        type="number"
                        id="input-harga-hotel-pemandu"
                        min="0"
                        step="0.01"
                        value={formData.jumlahHargaHotelPemandu || ''}
                        onChange={(e) =>
                          updateFormData({
                            jumlahHargaHotelPemandu: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        placeholder={driverHotelPlaceholderText}
                        className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-xl text-slate-800 text-base md:text-sm font-medium focus:outline-none focus:ring-2 focus:border-amber-500 transition-all placeholder:text-transparent sm:placeholder:text-slate-400 ${
                          submitted && driverNights > 0 && (!formData.jumlahHargaHotelPemandu || formData.jumlahHargaHotelPemandu <= 0)
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                            : 'border-slate-300 hover:border-slate-400 focus:ring-amber-500/20'
                        }`}
                      />
                      {(!formData.jumlahHargaHotelPemandu || formData.jumlahHargaHotelPemandu === 0) && (
                        <div className="absolute left-9 right-4 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none sm:hidden flex items-center h-full">
                          <span className="text-base text-slate-400 font-normal animate-marquee-mobile">
                            {driverHotelPlaceholderText}
                          </span>
                        </div>
                      )}
                    </div>
                    {submitted && driverNights > 0 && (!formData.jumlahHargaHotelPemandu || formData.jumlahHargaHotelPemandu <= 0) && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        Sila masukkan Jumlah Harga Hotel Pemandu
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                    <li>
                      {isDriverHotelSelected
                        ? 'Penginapan Hotel (Maksimum Kadar PBT - PW1)'
                        : 'Elaun Lojing (Kadar Tetap PBT - PW1)'}
                    </li>
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


