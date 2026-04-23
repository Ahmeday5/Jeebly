export interface AppUser {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  governorateId: number;
  districtid: number;
  role: string;
}

export interface AddUserPayload {
  fullName: string;
  address: string;
  password: string;
  email: string;
  birthDate: string;
  governorateId: number;
  districtid: number;
  phoneNumber: string;
  role: string;
}

export interface UpdateUserPayload {
  email: string;
  phone: string;
  fullName: string;
}
