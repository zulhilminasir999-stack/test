export type RankType = 'Pbt - PW1' | 'LtM - Kapt' | 'Mej - Kol';

export type VehicleType = 'Kereta' | 'Motosikal';

export type AreaType = 'W1' | 'W2'; // W1 = Semenanjung, W2 = Sabah / Sarawak / Labuan

export type AccommodationType = 'Hotel' | 'Lojing' | 'Campuran' | 'Tiada' | '';

export type ServiceBranch = 'Tentera Darat' | 'TLDM' | 'TUDM' | 'Markas ATM' | 'Lain-Lain';

export interface MileageRate {
  first500: number;
  above500: number;
}

export interface RankRateDetail {
  elaunHarian: Record<AreaType, number>;
  elaunMakan: Record<AreaType, number>;
  hotel: Record<AreaType, number | string>;
  hotelDefaultBenchmark?: Record<AreaType, number>;
  lojing: Record<AreaType, number | null>;
  allowedAccommodation: AccommodationType[];
}

export interface RateConfig {
  mileageRates: Record<VehicleType, MileageRate>;
  rankRates: Record<RankType, RankRateDetail>;
}

export interface ClaimFormData {
  // Step 1: Maklumat Pengguna
  nama: string;
  noTentera: string;
  perkhidmatan: ServiceBranch;
  perkhidmatanLain?: string;
  unit: string;
  tarikhMula: string;
  tarikhTamat: string;
  masaMula?: string;
  masaTamat?: string;
  tujuan: string;
  destinasi: string;

  // Step 2: Maklumat Perjalanan & Kelayakan
  pangkat: RankType | '';
  jenisKenderaan: VehicleType | '';
  jumlahKm: number;
  kawasan: AreaType | '';
  bilHariElaunHarian: number;
  bilHariElaunMakan: number;
  bilMalamPenginapan: number;
  jenisPenginapan: AccommodationType;
  bilMalamHotel?: number;
  bilMalamLojing?: number;
  kadarHotelBiasaActual?: number; // Custom rate for Brig Jen if actual receipt amount is specified

  // Step 3: Maklumat Pemandu
  gunaPemandu: boolean;
  namaPemandu?: string;
  noTenteraPemandu?: string;
  pemanduDisediakanKemudahan: boolean; // Adakah penginapan & makan pemandu disediakan?
}

export interface BreakdownItem {
  label: string;
  description: string;
  amount: number;
  unitPrice?: number;
  quantity?: number;
  unitLabel?: string;
}

export interface UserClaimBreakdown {
  totalEffectiveKm: number;
  mileageFirst500Km: number;
  mileageFirst500Rate: number;
  mileageFirst500Amount: number;
  
  mileageAbove500Km: number;
  mileageAbove500Rate: number;
  mileageAbove500Amount: number;
  
  mileageTotalAmount: number;
  
  dailyAllowanceDays: number;
  dailyAllowanceRate: number;
  dailyAllowanceAmount: number;
  
  mealAllowanceDays: number;
  mealAllowanceRate: number;
  mealAllowanceAmount: number;
  
  accommodationType: AccommodationType;
  accommodationNights: number;
  accommodationRate: number;
  accommodationRateLabel: string;
  accommodationAmount: number;
  
  hotelNights: number;
  hotelRate: number;
  hotelRateLabel: string;
  hotelAmount: number;
  
  lojingNights: number;
  lojingRate: number;
  lojingRateLabel: string;
  lojingAmount: number;
  
  subtotal: number;
}

export interface DriverClaimBreakdown {
  applicableRank: 'Pbt - PW1';
  mileageTotalAmount: number;
  
  dailyAllowanceDays: number;
  dailyAllowanceRate: number;
  dailyAllowanceAmount: number;
  
  mealAllowanceDays: number;
  mealAllowanceRate: number;
  mealAllowanceAmount: number;
  isMealProvided: boolean;
  
  accommodationNights: number;
  accommodationRate: number;
  accommodationAmount: number;
  isAccommodationProvided: boolean;
  
  subtotal: number;
}

export interface ClaimCalculationResult {
  userBreakdown: UserClaimBreakdown;
  driverBreakdown: DriverClaimBreakdown;
  grandTotal: number;
  calculatedAt: string;
}

export interface SavedClaimRecord {
  id: string;
  savedAt: string;
  formData: ClaimFormData;
  result: ClaimCalculationResult;
}
