import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private isAuthS = false;
  constructor() {}

  setIsAuthSection(isAuth: boolean) {
    this.isAuthS = isAuth;
  }

  getisAuthS(): boolean {
    return this.isAuthS;
  }
}
