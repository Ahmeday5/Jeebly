import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AddUserPayload, AppUser, UpdateUserPayload } from '../model/user.type';
import { environment } from '../../../../environments/environment';

function pick<T = any>(src: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (src?.[k] !== undefined && src?.[k] !== null) return src[k];
  }
  return undefined;
}

function normalizeRole(raw: any): string {
  const r = pick<any>(raw, 'role', 'Role', 'roles', 'Roles');
  if (Array.isArray(r)) return r[0] ?? '';
  return r ?? '';
}

function normalizeUser(raw: any): AppUser {
  if (!raw) return raw;
  const id = pick<string>(raw, 'userId', 'UserId', 'id', 'Id') ?? '';
  return {
    id,
    userId:       id,
    fullName:     pick(raw, 'fullName', 'FullName', 'name', 'Name') ?? '',
    email:        pick(raw, 'email', 'Email') ?? '',
    phoneNumber:  pick(raw, 'phoneNumber', 'PhoneNumber', 'phone', 'Phone') ?? '',
    address:      pick(raw, 'address', 'Address') ?? '',
    birthDate:    pick(raw, 'birthDate', 'BirthDate') ?? '',
    governorateId: pick(raw, 'governorateId', 'GovernorateId') ?? 0,
    districtid:   pick(raw, 'districtid', 'DistrictId', 'districtId') ?? 0,
    role:         normalizeRole(raw),
  };
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getAllUsers(): Observable<AppUser[]> {
    return this.api
      .get<any>('/api/AddUserByAdmin/GetAllUsers')
      .pipe(map((res) => (res.data ?? []).map(normalizeUser)));
  }

  getUserById(id: string): Observable<AppUser> {
    return this.api
      .get<any>(`/api/AddUserByAdmin/GetUserbyId?userid=${id}`)
      .pipe(map((res) => normalizeUser(res.data)));
  }

  addUser(payload: AddUserPayload): Observable<any> {
    return this.api.post<any>('/api/AddUserByAdmin/AddApplicationUser', payload);
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<any> {
    return this.api.put<any>(`/api/AddUserByAdmin/update-user/${id}`, payload);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.base}/api/AddUserByAdmin/delete-user/${id}`, {
      responseType: 'text',
    });
  }
}
