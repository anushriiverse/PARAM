export type AppLanguage = 'en' | 'mr' | 'hi';

export type AppScreen =
  | 'splash'
  | 'language'
  | 'add_location'
  | 'farmer_profile_setup'
  | 'add_crop'
  | 'home'
  | 'weather'
  | 'crops'
  | 'crop_detail_rice'
  | 'crop_detail_wheat'
  | 'advisory'
  | 'advisory_fertilizer'
  | 'advisory_irrigation'
  | 'crop_selector'
  | 'alerts'
  | 'farmer_profile';

export interface FarmerProfile {
  name: string;
  mobile: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  panchayat: string;
  farmArea: string;
  farmAreaUnit: 'Acres' | 'Hectares' | 'Gunthas';
  irrigationSource: string;
  avatarUrl?: string;
}

export interface CropItem {
  id: string;
  nameEn: string;
  nameMr: string;
  varietyEn: string;
  varietyMr: string;
  plotNameEn: string;
  plotNameMr: string;
  acres: number;
  sowingDate: string;
  stageEn: string;
  stageMr: string;
  stageProgress: number; // 0 to 100
  currentDay: number;
  totalDays: number;
  statusBadgeEn: string;
  statusBadgeMr: string;
  alertEn?: string;
  alertMr?: string;
  imageUrl: string;
  isActiveForAdvisory: boolean;
}

export interface WeatherDay {
  id: string;
  date: string;
  dayNameEn: string;
  dayNameMr: string;
  dayEn?: string;
  dayMr?: string;
  icon: string;
  tempHigh: number;
  tempLow: number;
  tempMax?: number;
  tempMin?: number;
  conditionEn: string;
  conditionMr: string;
  rainProb: number;
  rainChance?: number;
  rainAmountMm: number;
  humidity: number;
  windSpeedKmH: number;
  windDirection: string;
  uvIndex: number;
  irrigationAdviceEn: string;
  irrigationAdviceMr: string;
  sprayAdviceEn: string;
  sprayAdviceMr: string;
  fertilizerAdviceEn: string;
  fertilizerAdviceMr: string;
  isAlert?: boolean;
}
