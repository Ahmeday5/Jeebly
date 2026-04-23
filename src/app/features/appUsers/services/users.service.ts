import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AddUserPayload, AppUser, UpdateUserPayload } from '../model/user.type';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getAllUsers(): Observable<AppUser[]> {
    return this.api
      .get<any>('/api/AddUserByAdmin/ Get All Users')
      .pipe(map((res) => res.data ?? []));
  }

  getUserById(id: string): Observable<AppUser> {
    return this.api
      .get<any>(`/api/AddUserByAdmin/ Get User by Id?userid=${id}`)
      .pipe(map((res) => res.data));
  }

  addUser(payload: AddUserPayload): Observable<any> {
    return this.api.post<any>('/api/AddUserByAdmin/Add Application User', payload);
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
