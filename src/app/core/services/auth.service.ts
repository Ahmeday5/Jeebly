import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UserData } from '../types/login.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedInSubject = new BehaviorSubject<boolean>(
    localStorage.getItem('isLoggedIn') === 'true',
  );
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  userData$ = this.userDataSubject.asObservable();

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(
    this.getUserData()?.role || null,
  );
  public role$ = this.roleSubject.asObservable();

  private userData: UserData | null = null;

  get displayName(): string {
    if (!this.userData?.email) return 'Guest';

    // الاسم = الجزء قبل @ أو "Admin" لو مفيش @
    const emailParts = this.userData.email.split('@');
    return emailParts[0] || 'Admin';
  }

  get email(): string | null {
    return this.userData?.email || null;
  }

  // لو عايز observable للـ UI reactivity
  public displayName$ = new BehaviorSubject<string>('Guest');
  public email$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadUserData();
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.userData = JSON.parse(userData) as UserData;
        if (this.userData?.role) {
          this.roleSubject.next(this.userData.role);
          this.isLoggedInSubject.next(true);
          // ← مهم
          this.displayName$.next(this.displayName);
          this.email$.next(this.email);
        }
      } catch (error) {
        console.error('خطأ في تحليل userData:', error);
        this.logout();
      }
    }
  }

  login(response: any): void {
    const user = response.data;
    this.userData = user;
    this.isLoggedInSubject.next(true);
    this.roleSubject.next(response.role);
    this.displayName$.next(this.displayName);
    this.email$.next(this.email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(response));
    localStorage.setItem('token', user.token);
  }

  logout(): void {
    if (this.isLoggedInSubject.value) {
      this.isLoggedInSubject.next(false);
      this.roleSubject.next(null);
      this.userData = null;
      this.displayName$.next('Guest');
      this.email$.next(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('token');
    }
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token;
  }

  // جلب الدور الحالي
  getCurrentRole(): string | null {
    const role = this.roleSubject.value;
    return role;
  }

  getSavedEmail(): string | null {
    const savedEmail = localStorage.getItem('savedEmail');
    return savedEmail;
  }
}
