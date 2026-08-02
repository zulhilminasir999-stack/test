import {
  ClaimFormData,
  ClaimCalculationResult,
  UserClaimBreakdown,
  DriverClaimBreakdown,
  RateConfig,
  AccommodationType,
} from '../types';
import defaultRateConfig from '../data/rates.json';

export interface TravelDurationCalculation {
  totalHours: number;
  daysMakan: number;
  daysHarian: number;
  formattedDuration: string;
}

export function calculateTravelDuration(
  tarikhMula: string,
  masaMula?: string,
  tarikhTamat?: string,
  masaTamat?: string
): TravelDurationCalculation {
  if (!tarikhMula || !tarikhTamat) {
    return { totalHours: 0, daysMakan: 0, daysHarian: 0, formattedDuration: '0 jam' };
  }

  const startStr = `${tarikhMula}T${masaMula || '08:00'}`;
  const endStr = `${tarikhTamat}T${masaTamat || '08:00'}`;

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
    return { totalHours: 0, daysMakan: 0, daysHarian: 0, formattedDuration: '0 jam' };
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const totalHours = diffMs / (1000 * 60 * 60);

  let daysMakan = Math.floor(totalHours / 24);
  let daysHarian = 0;

  if (totalHours < 24) {
    daysMakan = 0;
    daysHarian = 0;
  } else if (totalHours === 24) {
    daysMakan = 1;
    daysHarian = 0;
  } else {
    const remainingHours = totalHours % 24;
    if (remainingHours >= 8) {
      daysHarian = 1;
    } else if (daysMakan > 1 && remainingHours === 0) {
      // Jika capai tepat 48 jam, 72 jam, dll., hari terakhir (24j) adalah > 8 jam
      daysHarian = 1;
    }
  }

  const fullDays = Math.floor(totalHours / 24);
  const remHours = Math.floor(totalHours % 24);
  const remMins = Math.round((totalHours - Math.floor(totalHours)) * 60);

  let formattedDuration = '';
  if (fullDays > 0) {
    formattedDuration += `${fullDays} hari `;
  }
  if (remHours > 0 || remMins > 0 || fullDays === 0) {
    if (remMins > 0) {
      formattedDuration += `${remHours} jam ${remMins} minit`;
    } else {
      formattedDuration += `${remHours} jam`;
    }
  }

  return {
    totalHours,
    daysMakan,
    daysHarian,
    formattedDuration: formattedDuration.trim(),
  };
}

export function calculateClaim(
  formData: ClaimFormData,
  customConfig?: RateConfig
): ClaimCalculationResult {
  const config: RateConfig = customConfig || (defaultRateConfig as RateConfig);

  const {
    pangkat,
    jenisKenderaan,
    jumlahKm,
    kawasan,
    tarikhMula,
    masaMula,
    tarikhTamat,
    masaTamat,
    bilHariElaunHarian,
    bilHariElaunMakan,
    bilMalamPenginapan,
    jenisPenginapan,
    kadarHotelBiasaActual,
    gunaPemandu,
    pemanduDisediakanKemudahan,
  } = formData;

  // --- 1. USER MILEAGE ---
  const mileageRates = config.mileageRates[jenisKenderaan] || config.mileageRates.Kereta;
  const oneWayKm = Math.max(0, jumlahKm || 0);
  // Total distance is round-trip (Pergi & Balik = x2)
  const totalEffectiveKm = oneWayKm * 2;

  let mileageFirst500Km = 0;
  let mileageFirst500Rate = mileageRates.first500;
  let mileageFirst500Amount = 0;

  let mileageAbove500Km = 0;
  let mileageAbove500Rate = mileageRates.above500;
  let mileageAbove500Amount = 0;

  let userMileageTotalAmount = 0;

  // Bayaran tol HANYA Boleh claim sekiranya user TIDAK memakai pemandu (!gunaPemandu)
  const rawToll = Math.max(0, formData.bayaranTol || 0);
  const tollAmount = !gunaPemandu ? rawToll : 0;

  // Elaun jarak & penggunaan kenderaan HANYA dikira sekiranya user TIDAK memakai pemandu (!gunaPemandu)
  if (!gunaPemandu) {
    mileageFirst500Km = Math.min(totalEffectiveKm, 500);
    mileageFirst500Amount = mileageFirst500Km * mileageFirst500Rate;

    mileageAbove500Km = Math.max(0, totalEffectiveKm - 500);
    mileageAbove500Amount = mileageAbove500Km * mileageAbove500Rate;

    userMileageTotalAmount = mileageFirst500Amount + mileageAbove500Amount;
  }

  // --- 2. USER ALLOWANCES ---
  const rankDetail = config.rankRates[pangkat] || config.rankRates['Pbt - PW1'];
  
  // Compute duration & allowance days automatically
  const durationInfo = calculateTravelDuration(tarikhMula, masaMula, tarikhTamat, masaTamat);
  
  // Use duration days if duration is valid, otherwise fallback to stored fields
  const mealAllowanceDays = durationInfo.totalHours > 0 ? durationInfo.daysMakan : Math.max(0, bilHariElaunMakan || 0);
  const dailyAllowanceDays = durationInfo.totalHours > 0 ? durationInfo.daysHarian : Math.max(0, bilHariElaunHarian || 0);

  // Daily Allowance
  const dailyAllowanceRate = rankDetail.elaunHarian[kawasan] || 0;
  const dailyAllowanceAmount = dailyAllowanceDays * dailyAllowanceRate;

  // Meal Allowance
  const mealAllowanceRate = rankDetail.elaunMakan[kawasan] || 0;
  const mealAllowanceAmount = mealAllowanceDays * mealAllowanceRate;

  // Accommodation Allowance (Hotel & Lojing separated)
  const hotelNights = Math.max(
    0,
    formData.bilMalamHotel ?? (formData.jenisPenginapan === 'Hotel' ? (formData.bilMalamPenginapan || 0) : 0)
  );

  let hotelRate = 0;
  let maxHotelRate: number | undefined = undefined;
  let enteredHotelPrice: number | undefined = undefined;
  let hotelRateLabel = '';

  const hotelRateVal = rankDetail?.hotel?.[kawasan];
  if (typeof hotelRateVal === 'number') {
    maxHotelRate = hotelRateVal;
    if (typeof formData.jumlahHargaHotel === 'number' && formData.jumlahHargaHotel > 0) {
      enteredHotelPrice = formData.jumlahHargaHotel;
      const pricePerNight = hotelNights > 0 ? enteredHotelPrice / hotelNights : enteredHotelPrice;
      // Capped at maximum claimable rate per night
      hotelRate = Math.min(pricePerNight, maxHotelRate);
      if (pricePerNight > maxHotelRate) {
        hotelRateLabel = `RM ${hotelRate.toFixed(2)} / malam (Had Maksimum)`;
      } else {
        hotelRateLabel = `RM ${hotelRate.toFixed(2)} / malam (Ikut Resit)`;
      }
    } else {
      // Default to maximum rate if no actual price specified
      hotelRate = maxHotelRate;
      hotelRateLabel = `RM ${hotelRate.toFixed(2)} / malam (Kadar Maksimum)`;
    }
  } else if (typeof hotelRateVal === 'string') {
    // e.g. "Sebenar"
    if (typeof formData.jumlahHargaHotel === 'number' && formData.jumlahHargaHotel > 0) {
      enteredHotelPrice = formData.jumlahHargaHotel;
      hotelRate = hotelNights > 0 ? enteredHotelPrice / hotelNights : enteredHotelPrice;
      hotelRateLabel = `RM ${hotelRate.toFixed(2)} / malam (Sebenar)`;
    } else {
      hotelRate = 0;
      hotelRateLabel = `Sebenar`;
    }
  }

  const hotelAmount = hotelNights * hotelRate;

  // Flat rate Lojing for all users: W1 = RM 100, W2 = RM 120
  const lojingNights = Math.max(
    0,
    formData.bilMalamLojing ?? (formData.jenisPenginapan === 'Lojing' ? (formData.bilMalamPenginapan || 0) : 0)
  );
  const lojingRate = kawasan === 'W2' ? 120 : 100;
  const lojingRateLabel = `RM ${lojingRate.toFixed(2)} / malam`;
  const lojingAmount = lojingNights * lojingRate;

  const totalAccommodationNights = hotelNights + lojingNights;
  const totalAccommodationAmount = hotelAmount + lojingAmount;

  const userSubtotal =
    userMileageTotalAmount +
    tollAmount +
    dailyAllowanceAmount +
    mealAllowanceAmount +
    totalAccommodationAmount;

  const userBreakdown: UserClaimBreakdown = {
    totalEffectiveKm,
    mileageFirst500Km,
    mileageFirst500Rate,
    mileageFirst500Amount,
    mileageAbove500Km,
    mileageAbove500Rate,
    mileageAbove500Amount,
    mileageTotalAmount: userMileageTotalAmount,
    tollAmount,
    dailyAllowanceDays,
    dailyAllowanceRate,
    dailyAllowanceAmount,
    mealAllowanceDays,
    mealAllowanceRate,
    mealAllowanceAmount,
    accommodationType: lojingNights > 0 && hotelNights === 0 ? 'Lojing' : 'Hotel',
    accommodationNights: totalAccommodationNights,
    accommodationRate: hotelRate || lojingRate,
    accommodationRateLabel: hotelRateLabel || lojingRateLabel,
    accommodationAmount: totalAccommodationAmount,
    hotelNights,
    hotelRate,
    maxHotelRate,
    enteredHotelPrice,
    hotelRateLabel,
    hotelAmount,
    lojingNights,
    lojingRate,
    lojingRateLabel,
    lojingAmount,
    subtotal: userSubtotal,
  };

  // --- 3. DRIVER CALCULATIONS ---
  let driverBreakdown: DriverClaimBreakdown;

  if (!gunaPemandu) {
    driverBreakdown = {
      applicableRank: 'Pbt - PW1',
      mileageTotalAmount: 0,
      dailyAllowanceDays: 0,
      dailyAllowanceRate: 0,
      dailyAllowanceAmount: 0,
      mealAllowanceDays: 0,
      mealAllowanceRate: 0,
      mealAllowanceAmount: 0,
      isMealProvided: false,
      accommodationNights: 0,
      accommodationRate: 0,
      accommodationAmount: 0,
      isAccommodationProvided: false,
      subtotal: 0,
    };
  } else {
    // Driver uses Pbt - PW1 rates for daily & meal allowance
    const driverRankDetail = config.rankRates['Pbt - PW1'];

    // Mileage allowance is 0 when driver is used
    const driverMileageTotalAmount = 0;

    // Driver Daily Allowance (Always gets Daily Allowance)
    const driverDailyRate = driverRankDetail.elaunHarian[kawasan] || 0;
    const driverDailyAmount = dailyAllowanceDays * driverDailyRate;

    // Driver Meals (Driver is never provided meals - always receives meal allowance for every duty day)
    const driverMealRate = driverRankDetail.elaunMakan[kawasan] || 0;
    const driverMealAmount = mealAllowanceDays * driverMealRate;

    // Driver Accommodation
    let driverAccomRate = 0;
    let driverAccomAmount = 0;
    let driverAccomType: AccommodationType | undefined = undefined;

    if (!pemanduDisediakanKemudahan) {
      driverAccomType = formData.jenisPenginapanPemandu || 'Hotel';
      const maxDriverHotelRate = typeof driverRankDetail?.hotel?.[kawasan] === 'number'
        ? driverRankDetail.hotel[kawasan]
        : 200;
      const driverLojingRate = typeof driverRankDetail?.lojing?.[kawasan] === 'number'
        ? driverRankDetail.lojing[kawasan]
        : (kawasan === 'W2' ? 120 : 100);

      if (driverAccomType === 'Lojing') {
        driverAccomRate = driverLojingRate;
        driverAccomAmount = totalAccommodationNights * driverLojingRate;
      } else {
        // Hotel
        let driverHotelRate = maxDriverHotelRate;
        if (typeof formData.jumlahHargaHotelPemandu === 'number' && formData.jumlahHargaHotelPemandu > 0 && totalAccommodationNights > 0) {
          const pricePerNight = formData.jumlahHargaHotelPemandu / totalAccommodationNights;
          driverHotelRate = Math.min(pricePerNight, maxDriverHotelRate);
        } else if (typeof formData.jumlahHargaHotel === 'number' && formData.jumlahHargaHotel > 0 && totalAccommodationNights > 0 && (!formData.jumlahHargaHotelPemandu || formData.jumlahHargaHotelPemandu === 0)) {
          const pricePerNight = formData.jumlahHargaHotel / totalAccommodationNights;
          driverHotelRate = Math.min(pricePerNight, maxDriverHotelRate);
        }
        driverAccomRate = driverHotelRate;
        driverAccomAmount = totalAccommodationNights * driverHotelRate;
      }
    }

    const driverSubtotal =
      driverMileageTotalAmount +
      driverDailyAmount +
      driverMealAmount +
      driverAccomAmount;

    driverBreakdown = {
      applicableRank: 'Pbt - PW1',
      mileageTotalAmount: driverMileageTotalAmount,
      dailyAllowanceDays,
      dailyAllowanceRate: driverDailyRate,
      dailyAllowanceAmount: driverDailyAmount,
      mealAllowanceDays,
      mealAllowanceRate: driverMealRate,
      mealAllowanceAmount: driverMealAmount,
      isMealProvided: false,
      accommodationType: driverAccomType,
      accommodationNights: totalAccommodationNights,
      accommodationRate: driverAccomRate,
      accommodationAmount: driverAccomAmount,
      isAccommodationProvided: pemanduDisediakanKemudahan,
      subtotal: driverSubtotal,
    };
  }

  const grandTotal = userSubtotal + driverBreakdown.subtotal;

  return {
    userBreakdown,
    driverBreakdown,
    grandTotal,
    calculatedAt: new Date().toISOString(),
  };
}

export function formatMYR(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
