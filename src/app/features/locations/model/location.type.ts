export interface Governorate {
  governorateId: number;
  nameAr: string;
  nameEn: string;
}

export interface District {
  districtId: number;
  nameAr: string;
  nameEn: string;
  governorateId: number;
}

export interface GovernoratePayload {
  nameAr: string;
  nameEn: string;
}

export interface DistrictPayload {
  nameAr: string;
  nameEn: string;
  governorateId: number;
}
