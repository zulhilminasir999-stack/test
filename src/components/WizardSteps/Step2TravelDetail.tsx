import React from 'react';
import {
  ClaimFormData,
  RankType,
  VehicleType,
  AreaType,
  AccommodationType,
} from '../../types';
import { SearchableDropdown, OptionItem } from '../SearchableDropdown';
import { calculateClaim, calculateTravelDuration, formatMYR } from '../../utils/calculator';
import defaultRateConfig from '../../data/rates.json';
import {
  Car,
  Bike,
  Award,
  Navigation,
  Globe2,
  Hotel,
  Home,
  Info,
  Calculator,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Timer,
  Check,
} from 'lucide-react';

interface Step2TravelDetailProps {
  formData: ClaimFormData;
  updateFormData: (updates: Partial<ClaimFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const rankOptions: OptionItem<RankType>[] = [
  {
    value: 'Pbt - PW1',
    label: 'PBT – PW1',
  },
  {
    value: 'LtM - Kapt',
    label: 'LTM – KAPT',
  },
  {
    value: 'Mej - Kol',
    label: 'MEJ – KOL',
  },
];

const vehicleOptions: OptionItem<VehicleType>[] = [
  {
    value: 'Kereta',
    label: 'KERETA',
  },
  {
    value: 'Motosikal',
    label: 'MOTOSIKAL',
  },
];

const areaOptions: OptionItem<AreaType>[] = [
  {
    value: 'W1',
    label: 'SEMENANJUNG MALAYSIA (W1)',
  },
  {
    value: 'W2',
    label: 'SABAH / SARAWAK / LABUAN (W2)',
  },
];

const accommodationOptions: OptionItem<AccommodationType>[] = [
  {
    value: 'Hotel',
    label: 'HOTEL',
  },
  {
    value: 'Lojing',
    label: 'LOJING',
  },
];

export function Step2TravelDetail({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Step2TravelDetailProps) {
  const [submitted, setSubmitted] = React.useState(false);

  // Compute live calculation preview
  const liveResult = calculateClaim(formData);
  const userBreakdown = liveResult.userBreakdown;

  // Handle rank change
  const handleRankChange = (newRank: RankType) => {
    updateFormData({ pangkat: newRank });
  };

  const rankDetail = formData.pangkat ? (defaultRateConfig.rankRates as Record<string, any>)[formData.pangkat] : null;
  const hotelVal = rankDetail && formData.kawasan ? rankDetail.hotel[formData.kawasan] : null;
  const currentRankHotelRate = typeof hotelVal === 'number'
    ? `RM ${hotelVal.toFixed(2)}/malam`
    : '-';

  // Compute live duration
  const durationInfo = calculateTravelDuration(
    formData.tarikhMula,
    formData.masaMula || '08:00',
    formData.tarikhTamat,
    formData.masaTamat || '08:00'
  );

  const isPangkatValid = !!formData.pangkat;
  const isJenisKenderaanValid = !!formData.jenisKenderaan;
  const isJumlahKmValid = !!formData.jumlahKm && formData.jumlahKm > 0;
  const isKawasanValid = !!formData.kawasan;
  const isTarikhValid = !!formData.tarikhMula && !!formData.tarikhTamat && durationInfo.totalHours > 0;
  const isLessThanOneDay = !formData.tarikhMula || !formData.tarikhTamat || durationInfo.daysMakan < 1;

  // Determine current selected accommodation option
  const totalNights = durationInfo.daysMakan;
  const currentHotelNights = formData.bilMalamHotel ?? 0;
  const currentLojingNights = formData.bilMalamLojing ?? 0;

  let accomOption: AccommodationType = formData.jenisPenginapan || '';
  if (!formData.jenisPenginapan) {
    if (currentHotelNights > 0 && currentLojingNights === 0) {
      accomOption = 'Hotel';
    } else if (currentLojingNights > 0 && currentHotelNights === 0) {
      accomOption = 'Lojing';
    } else {
      accomOption = '';
    }
  }

  const isHotelSelected =
    !isLessThanOneDay &&
    (formData.jenisPenginapan === 'Hotel' ||
      (currentHotelNights > 0 && currentLojingNights === 0));

  const isLojingSelected =
    !isLessThanOneDay &&
    (formData.jenisPenginapan === 'Lojing' ||
      (currentLojingNights > 0 && currentHotelNights === 0));

  const handleAccommodationChange = (val: string) => {
    if (isLessThanOneDay) return;
    if (val === 'Hotel') {
      updateFormData({
        jenisPenginapan: 'Hotel',
        bilMalamHotel: totalNights,
        bilMalamLojing: 0,
        bilMalamPenginapan: totalNights,
      });
    } else if (val === 'Lojing') {
      updateFormData({
        jenisPenginapan: 'Lojing',
        bilMalamLojing: totalNights,
        bilMalamHotel: 0,
        bilMalamPenginapan: totalNights,
      });
    } else {
      updateFormData({
        jenisPenginapan: '',
        bilMalamHotel: 0,
        bilMalamLojing: 0,
        bilMalamPenginapan: 0,
      });
    }
  };

  // Sync calculated allowance days & nights to formData if duration is valid
  React.useEffect(() => {
    if (durationInfo.totalHours > 0) {
      const updates: Partial<ClaimFormData> = {};
      if (formData.bilHariElaunMakan !== durationInfo.daysMakan) {
        updates.bilHariElaunMakan = durationInfo.daysMakan;
      }
      if (formData.bilHariElaunHarian !== durationInfo.daysHarian) {
        updates.bilHariElaunHarian = durationInfo.daysHarian;
      }

      if (isLessThanOneDay) {
        if (
          formData.bilMalamHotel !== 0 ||
          formData.bilMalamLojing !== 0 ||
          formData.bilMalamPenginapan !== 0
        ) {
          updates.bilMalamHotel = 0;
          updates.bilMalamLojing = 0;
          updates.bilMalamPenginapan = 0;
        }
      } else {
        // Auto-sync nights when dates change if Hotel or Lojing is selected
        if (isHotelSelected && formData.bilMalamHotel !== totalNights) {
          updates.bilMalamHotel = totalNights;
          updates.bilMalamPenginapan = totalNights;
        } 
        if (isLojingSelected && formData.bilMalamLojing !== totalNights) {
          updates.bilMalamLojing = totalNights;
          updates.bilMalamPenginapan = totalNights;
        }
      }

      if (Object.keys(updates).length > 0) {
        updateFormData(updates);
      }
    }
  }, [
    formData.tarikhMula,
    formData.masaMula,
    formData.tarikhTamat,
    formData.masaTamat,
    durationInfo.totalHours,
    durationInfo.daysMakan,
    durationInfo.daysHarian,
    totalNights,
    isHotelSelected,
    isLojingSelected,
    isLessThanOneDay,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const isTarikhValid = formData.tarikhMula && formData.tarikhTamat && durationInfo.totalHours > 0;

    if (
      !isPangkatValid ||
      !isJenisKenderaanValid ||
      !isJumlahKmValid ||
      !isKawasanValid ||
      !isTarikhValid
    ) {
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full" id="step2-form">
      {/* Main Form Container Box */}
      <div className="bg-white p-6 sm:p-8 pb-12 sm:pb-16 rounded-2xl border border-slate-100 shadow-sm space-y-5 my-2 sm:my-3">
        {/* Container Title */}
        <div className="pb-2 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Maklumat Perjalanan
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sila masukkan maklumat perjalanan rasmi anda
          </p>
        </div>

        {/* Section 1: Pangkat */}
        <div className="space-y-2">
          <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider">
            Pangkat <span className="text-amber-600">*</span>
          </label>
          <SearchableDropdown<RankType | ''>
            id="dropdown-pangkat"
            required
            hideBadge
            hasError={submitted && !isPangkatValid}
            options={rankOptions}
            value={formData.pangkat}
            onChange={(val) => handleRankChange(val as RankType)}
            placeholder="Pilih Pangkat"
          />
          {submitted && !isPangkatValid && (
            <p className="text-xs text-red-600 font-semibold mt-1">Sila pilih Pangkat</p>
          )}
        </div>

        {/* Section 2: Pengangkutan */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wider">
            Pengangkutan
          </h3>

          {/* Jenis Kenderaan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Kenderaan <span className="text-amber-600">*</span>
            </label>
            <SearchableDropdown<VehicleType | ''>
              id="dropdown-kenderaan"
              required
              hasError={submitted && !isJenisKenderaanValid}
              options={vehicleOptions}
              value={formData.jenisKenderaan}
              onChange={(val) => updateFormData({ jenisKenderaan: val as VehicleType })}
              placeholder="Pilih Jenis Kenderaan"
            />
            {submitted && !isJenisKenderaanValid && (
              <p className="text-xs text-red-600 font-semibold mt-1">Sila pilih Jenis Kenderaan</p>
            )}
          </div>

          {/* Jumlah Kilometer */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Jumlah Kilometer <span className="text-amber-600">*</span>
              </label>
            </div>

            <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  value={formData.jumlahKm || 0}
                  onChange={(e) =>
                    updateFormData({
                      jumlahKm: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:hover:bg-amber-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="relative shrink-0">
                  <input
                    type="number"
                    id="input-jumlah-km"
                    min="0"
                    step="0.1"
                    required
                    value={formData.jumlahKm || ''}
                    onChange={(e) =>
                      updateFormData({
                        jumlahKm: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    placeholder="0"
                    className={`w-28 px-3 py-2 bg-white border rounded-lg text-slate-800 text-sm font-semibold text-right pr-9 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                      submitted && !isJumlahKmValid
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                    KM
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto touch-pan-x scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {[10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateFormData({ jumlahKm: preset })}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all shrink-0 active:scale-95 touch-manipulation ${
                      formData.jumlahKm === preset
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset} KM
                  </button>
                ))}
              </div>
            </div>

            {submitted && !isJumlahKmValid && (
              <p className="text-xs text-red-600 font-semibold mt-1">Sila masukkan Jumlah Kilometer (KM) yang sah</p>
            )}
          </div>
        </div>

        {/* Section 3: Kawasan Wilayah */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wider">
            Kawasan Wilayah <span className="text-amber-600">*</span>
          </h3>

          <div>
            <SearchableDropdown<AreaType | ''>
              id="dropdown-kawasan"
              required
              hasError={submitted && !isKawasanValid}
              options={areaOptions}
              value={formData.kawasan}
              onChange={(val) => updateFormData({ kawasan: val as AreaType })}
              placeholder="Pilih Kawasan"
            />
            {submitted && !isKawasanValid && (
              <p className="text-xs text-red-600 font-semibold mt-1">Sila pilih Kawasan Wilayah</p>
            )}
          </div>
        </div>

        {/* Section 4: Masa & Tempoh Tugasan */}
        <div className="space-y-4 pt-4 border-t border-slate-100" id="section-masa-tugasan">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wider">
              Masa Tugasan / Perjalanan <span className="text-amber-600">*</span>
            </h3>
            {durationInfo.totalHours > 0 && (
              <span className="text-xs font-bold font-sans text-slate-700">
                {durationInfo.formattedDuration} ({durationInfo.totalHours.toFixed(1)}j)
              </span>
            )}
          </div>

          {/* Tarikh & Masa Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Tarikh Mula</label>
              <input
                type="date"
                id="input-tarikh-mula"
                required
                value={formData.tarikhMula || ''}
                onChange={(e) => updateFormData({ tarikhMula: e.target.value })}
                className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base md:text-sm transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none ${
                  !formData.tarikhMula ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Masa Mula</label>
              <input
                type="time"
                id="input-masa-mula"
                required
                value={formData.masaMula || ''}
                onChange={(e) => updateFormData({ masaMula: e.target.value })}
                className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base md:text-sm transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none ${
                  !formData.masaMula ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Tarikh Tamat</label>
              <input
                type="date"
                id="input-tarikh-tamat"
                required
                value={formData.tarikhTamat || ''}
                onChange={(e) => updateFormData({ tarikhTamat: e.target.value })}
                className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base md:text-sm transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none ${
                  !formData.tarikhTamat ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Masa Tamat</label>
              <input
                type="time"
                id="input-masa-tamat"
                required
                value={formData.masaTamat || ''}
                onChange={(e) => updateFormData({ masaTamat: e.target.value })}
                className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base md:text-sm transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none ${
                  !formData.masaTamat ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                }`}
              />
            </div>
          </div>

          {submitted && !isTarikhValid && (
            <p className="text-xs text-red-600 font-semibold mt-1">
              {durationInfo.totalHours <= 0
                ? 'Sila pastikan Tarikh & Masa Tamat adalah selepas Tarikh & Masa Mula.'
                : 'Sila masukkan Tarikh Mula dan Tarikh Tamat.'}
            </p>
          )}

          {/* Automatic Allowance Summary */}
          {durationInfo.totalHours > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-600 font-medium">Kelayakan Tuntutan: </span>
                <span className="font-bold text-amber-950">
                  {durationInfo.daysMakan} Hari Elaun Makan
                  {durationInfo.daysHarian > 0 ? `, ${durationInfo.daysHarian} Hari Elaun Harian` : ' (Tiada Elaun Harian)'}
                </span>
              </div>
              <span className="text-amber-900/90 text-[11px] font-medium">
                * Elaun makan (1 hari = 24 jam). Elaun harian layak 1 hari bagi lebihan &gt; 8 jam pada hari terakhir (tugasan &gt; 24 jam).
              </span>
            </div>
          )}
        </div>

        {/* Section 5: Penginapan */}
        <div className="space-y-4 pt-4 border-t border-slate-100" id="section-penginapan">
          <h3 className="text-xs uppercase font-bold text-slate-800 tracking-wider">
            Penginapan
          </h3>

          {isLessThanOneDay ? (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Penginapan Tidak Boleh Dipilih</p>
                <p className="text-amber-800/90 mt-0.5">
                  Penginapan hanya layak untuk tugasan melebihi 24 jam.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Jenis Penginapan <span className="text-amber-600">*</span>
              </label>

              <SearchableDropdown<AccommodationType | ''>
                id="dropdown-penginapan"
                required
                hideBadge
                hasError={submitted && !formData.jenisPenginapan}
                options={accommodationOptions}
                value={formData.jenisPenginapan || (isHotelSelected ? 'Hotel' : isLojingSelected ? 'Lojing' : '')}
                onChange={(val) => handleAccommodationChange(val)}
                placeholder="Pilih Jenis Penginapan"
              />
              {submitted && !formData.jenisPenginapan && (
                <p className="text-xs text-red-600 font-semibold mt-1">Sila pilih jenis penginapan</p>
              )}
            </div>
          )}



        </div>
      </div>

      {/* Form Bottom Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          id="btn-step2-prev"
          onClick={onPrev}
          className="px-5 py-2.5 border border-orange-200 bg-white hover:bg-orange-50/50 text-orange-800 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          type="submit"
          id="btn-step2-next"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          Seterusnya <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
