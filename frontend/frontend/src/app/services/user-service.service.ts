import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userEmail: string | null = null;
  private userName: string | null = null;

  constructor() {
    this.userEmail = sessionStorage.getItem('userEmail');
    this.userName = sessionStorage.getItem('userName');
  }

  setUser(email: string, name: string): void {
    this.userEmail = email;
    this.userName = name;

    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userName', name);
  }

  getUserEmail(): string | null {
    return this.userEmail || sessionStorage.getItem('userEmail');
  }

  getUserName(): string | null {
    return this.userName || sessionStorage.getItem('userName');
  }

  clearUser(): void {
    this.userEmail = null;
    this.userName = null;
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
  }
}
